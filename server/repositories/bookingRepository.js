import mongoose from 'mongoose';

import Booking from '../models/Booking.js';
import User from '../models/User.js';
import Worker from '../models/Worker.js';
import Service from '../models/Service.js';
import {
  getCoordinatesFromAddress,
  isValidLatitude,
  isValidLongitude,
} from '../services/locationService.js';

const ALLOWED_STATUSES = ['pending', 'accepted', 'in_progress', 'completed', 'cancelled'];
const VALID_STATUS_TRANSITIONS = {
  pending: ['accepted', 'cancelled'],
  accepted: ['in_progress', 'cancelled'],
  in_progress: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
};

function mapBookingToApi(booking, options = {}) {
  const { customer, distanceKm, serviceName } = options;
  const safeDistance = distanceKm === undefined || distanceKm === null || !Number.isFinite(Number(distanceKm))
    ? null
    : Number(Number(distanceKm).toFixed(2));

  const customerName = customer?.name || null;

  return {
    id: String(booking._id),
    customerId: String(booking.customerId),
    workerId: String(booking.workerId),
    serviceId: String(booking.serviceId),
    serviceName: serviceName || null,
    address: booking.address || '',
    latitude: booking.latitude !== undefined ? Number(booking.latitude) : undefined,
    longitude: booking.longitude !== undefined ? Number(booking.longitude) : undefined,
    scheduledAt: booking.scheduledAt ? new Date(booking.scheduledAt).toISOString() : null,
    amount: Number(booking.amount || 0),
    status: booking.status || 'pending',
    createdAt: booking.createdAt ? new Date(booking.createdAt).toISOString() : null,
    ...(customerName ? { customer: { name: customerName } } : { customer: null }),
    customerName,
    distanceKm: safeDistance,
  };
}

export function validateBookingStatus(status) {
  if (!status || !ALLOWED_STATUSES.includes(status)) {
    const error = new Error(`Status must be one of: ${ALLOWED_STATUSES.join(', ')}`);
    error.statusCode = 400;
    throw error;
  }
}

export async function getAllBookingsFromDb(filters = {}) {
  const query = {};

  if (filters.customerId) {
    query.customerId = filters.customerId;
  }

  if (filters.workerId) {
    query.workerId = filters.workerId;
  }

  if (filters.status) {
    query.status = filters.status;
  }

  return Booking.find(query).sort({ createdAt: -1 }).lean();
}

export async function getBookingByIdFromDb(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return null;
  }

  return Booking.findById(id).lean();
}

function escapeRegex(value = '') {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function resolveServiceReference(serviceId) {
  if (!serviceId) {
    return null;
  }

  if (mongoose.Types.ObjectId.isValid(serviceId)) {
    return serviceId;
  }

  const serviceName = String(serviceId).trim();
  if (!serviceName) {
    return null;
  }

  const matchingService = await Service.findOne({
    $or: [
      { name: { $regex: new RegExp(`^${escapeRegex(serviceName)}$`, 'i') } },
      { category: { $regex: new RegExp(`^${escapeRegex(serviceName)}$`, 'i') } },
    ],
  }).lean();

  return matchingService ? String(matchingService._id) : null;
}

export async function verifyBookingReferences({ customerId, workerId, serviceId }) {
  if (!mongoose.Types.ObjectId.isValid(customerId)) {
    const error = new Error('Customer ID is invalid.');
    error.statusCode = 400;
    throw error;
  }

  if (!mongoose.Types.ObjectId.isValid(workerId)) {
    const error = new Error('Worker ID is invalid.');
    error.statusCode = 400;
    throw error;
  }

  const resolvedServiceId = await resolveServiceReference(serviceId);
  if (!resolvedServiceId || !mongoose.Types.ObjectId.isValid(resolvedServiceId)) {
    const error = new Error('Service ID is invalid.');
    error.statusCode = 400;
    throw error;
  }

  const [customer, worker, service] = await Promise.all([
    User.findById(customerId).lean(),
    Worker.findById(workerId).lean(),
    Service.findById(resolvedServiceId).lean(),
  ]);

  if (!customer) {
    const error = new Error('Customer not found.');
    error.statusCode = 404;
    throw error;
  }

  if (!worker) {
    const error = new Error('Worker not found.');
    error.statusCode = 404;
    throw error;
  }

  if (!service) {
    const error = new Error('Service not found.');
    error.statusCode = 404;
    throw error;
  }

  return { customer, worker, service };
}

export async function createBookingInDb(payload) {
  const {
    customerId,
    workerId,
    serviceId,
    address,
    latitude,
    longitude,
    scheduledAt,
    // NOTE: any client-supplied `amount` is intentionally ignored below.
    // The trusted amount always comes from Service.basePrice in the database.
  } = payload || {};

  if (!workerId || !serviceId || !scheduledAt) {
    const error = new Error('workerId, serviceId, and scheduledAt are required.');
    error.statusCode = 400;
    throw error;
  }

  if (!customerId) {
    const error = new Error('Authenticated customer context is required to create a booking.');
    error.statusCode = 400;
    throw error;
  }

  const resolvedServiceId = await resolveServiceReference(serviceId);
  if (!resolvedServiceId || !mongoose.Types.ObjectId.isValid(resolvedServiceId)) {
    const error = new Error('Service ID is invalid.');
    error.statusCode = 400;
    throw error;
  }

  const { service } = await verifyBookingReferences({ customerId, workerId, serviceId: resolvedServiceId });

  if (service.isActive === false) {
    const error = new Error('This service is not currently available for booking.');
    error.statusCode = 400;
    throw error;
  }

  // Server-side source of truth: the booking amount is always the service's
  // trusted base price, never a value supplied by the client.
  const parsedAmount = Number(service.basePrice);
  if (!Number.isFinite(parsedAmount) || parsedAmount < 0) {
    const error = new Error('Service price is invalid or missing.');
    error.statusCode = 500;
    throw error;
  }

  const trimmedAddress = typeof address === 'string' ? address.trim() : '';
  let parsedLatitude = latitude === undefined ? undefined : Number(latitude);
  let parsedLongitude = longitude === undefined ? undefined : Number(longitude);

  if (!isValidLatitude(parsedLatitude) || !isValidLongitude(parsedLongitude)) {
    if (trimmedAddress) {
      const geocoded = await getCoordinatesFromAddress(trimmedAddress);
      parsedLatitude = geocoded.latitude;
      parsedLongitude = geocoded.longitude;
    } else {
      const error = new Error('A valid booking location is required. Provide latitude/longitude or an address.');
      error.statusCode = 400;
      throw error;
    }
  }

  const hasUsableCoordinates = isValidLatitude(parsedLatitude) && isValidLongitude(parsedLongitude);

  if (!trimmedAddress && !hasUsableCoordinates) {
    const error = new Error('A valid booking location is required. Provide latitude/longitude or an address.');
    error.statusCode = 400;
    throw error;
  }

  const parsedDate = new Date(scheduledAt);
  if (Number.isNaN(parsedDate.getTime())) {
    const error = new Error('scheduledAt must be a valid date.');
    error.statusCode = 400;
    throw error;
  }

  const booking = await Booking.create({
    customerId,
    workerId,
    serviceId: resolvedServiceId,
    address: trimmedAddress,
    latitude: parsedLatitude,
    longitude: parsedLongitude,
    scheduledAt: parsedDate,
    amount: parsedAmount,
    status: 'pending',
  });

  return Booking.findById(booking._id).lean();
}

export function validateBookingTransition(currentStatus, nextStatus) {
  const allowedNextStatuses = VALID_STATUS_TRANSITIONS[currentStatus] || [];

  if (!allowedNextStatuses.includes(nextStatus)) {
    const error = new Error(
      `Invalid booking transition: "${currentStatus || 'unknown'}" -> "${nextStatus}".`
    );
    error.statusCode = 400;
    throw error;
  }
}

export async function updateBookingStatusInDb(id, status) {
  validateBookingStatus(status);

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return null;
  }

  const existingBooking = await Booking.findById(id).lean();

  if (!existingBooking) {
    return null;
  }

  validateBookingTransition(existingBooking.status || 'pending', status);

  const booking = await Booking.findByIdAndUpdate(
    id,
    { status },
    { returnDocument: 'after', runValidators: true }
  ).lean();

  return booking;
}

export { mapBookingToApi };