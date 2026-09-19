import mongoose from 'mongoose';

import User from '../models/User.js';
import Worker from '../models/Worker.js';
import {
  createBookingInDb,
  getAllBookingsFromDb,
  getBookingByIdFromDb,
  mapBookingToApi,
  updateBookingStatusInDb,
  validateBookingStatus,
} from '../repositories/bookingRepository.js';
import {
  createBookingNotification,
} from '../services/notificationService.js';
import { calculateRoute } from '../services/locationService.js';

function buildBookingQueryForUser(user, overrideFilters = {}) {
  if (!user) {
    return {};
  }

  if (user.role === 'admin') {
    return overrideFilters;
  }

  if (user.role === 'customer') {
    return {
      ...overrideFilters,
      customerId: new mongoose.Types.ObjectId(user.userId),
    };
  }

  if (user.role === 'worker') {
    return {
      ...overrideFilters,
      workerId: new mongoose.Types.ObjectId(user.workerId),
    };
  }

  return {};
}

async function enrichBookingForWorker(booking, workerRecord) {
  if (!workerRecord) {
    return mapBookingToApi(booking);
  }

  const customer = await User.findById(booking.customerId).select('name').lean();
  const workerLatitude = Number(workerRecord.latitude);
  const workerLongitude = Number(workerRecord.longitude);
  const bookingLatitude = Number(booking.latitude);
  const bookingLongitude = Number(booking.longitude);

  const hasValidWorkerCoordinates = Number.isFinite(workerLatitude) && Number.isFinite(workerLongitude);
  const hasValidBookingCoordinates = Number.isFinite(bookingLatitude) && Number.isFinite(bookingLongitude);

  let distanceKm = null;

  if (hasValidWorkerCoordinates && hasValidBookingCoordinates) {
    try {
      const route = await calculateRoute(
        { latitude: workerLatitude, longitude: workerLongitude },
        { latitude: bookingLatitude, longitude: bookingLongitude }
      );
      distanceKm = route?.distanceKm ?? null;
    } catch (error) {
      distanceKm = null;
    }
  }

  return mapBookingToApi(booking, { customer, distanceKm });
}

export const createBooking = async (req, res, next) => {
  try {
    const bookingData = req.body || {};

    if (!req.user || !req.user.userId) {
      const error = new Error('Authentication required.');
      error.statusCode = 401;
      throw error;
    }

    if (req.user.role !== 'customer') {
      const error = new Error('Only customers can create bookings.');
      error.statusCode = 403;
      throw error;
    }

    if (bookingData.customerId && String(bookingData.customerId) !== String(req.user.userId)) {
      const error = new Error('You cannot create a booking for a different customer.');
      error.statusCode = 403;
      throw error;
    }

    const safePayload = {
      ...bookingData,
      customerId: req.user.userId,
    };

    const booking = await createBookingInDb(safePayload);

    const worker = await Worker.findById(booking.workerId).lean();
    if (worker && worker.userId) {
      await createBookingNotification({
        recipientId: worker.userId,
        recipientRole: 'worker',
        type: 'NEW_BOOKING',
        title: 'New booking received',
        message: 'A customer has created a new service booking.',
        bookingId: booking._id,
      });
    }

    return res.status(201).json({
      success: true,
      booking: mapBookingToApi(booking),
    });
  } catch (error) {
    return next(error);
  }
};

export const getAllBookings = async (req, res, next) => {
  try {
    if (!req.user || !req.user.userId) {
      const error = new Error('Authentication required.');
      error.statusCode = 401;
      throw error;
    }

    let filters = {};

    if (req.user.role === 'customer') {
      filters.customerId = new mongoose.Types.ObjectId(req.user.userId);
    } else if (req.user.role === 'worker') {
      const worker = await Worker.findOne({ userId: req.user.userId }).lean();

      if (!worker) {
        const error = new Error('Worker not found for the authenticated user.');
        error.statusCode = 403;
        throw error;
      }

      filters.workerId = worker._id;
    } else if (req.user.role !== 'admin') {
      const error = new Error('You do not have permission to view bookings.');
      error.statusCode = 403;
      throw error;
    }

    const bookings = await getAllBookingsFromDb(filters);
    const workerRecord = req.user.role === 'worker'
      ? await Worker.findOne({ userId: req.user.userId }).lean()
      : null;

    const mappedBookings = await Promise.all(
      bookings.map((booking) => enrichBookingForWorker(booking, workerRecord))
    );

    return res.status(200).json({
      success: true,
      bookings: mappedBookings,
    });
  } catch (error) {
    return next(error);
  }
};

export const getBookingById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const booking = await getBookingByIdFromDb(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: `Booking not found: ${id}`,
      });
    }

    if (!req.user || !req.user.userId) {
      const error = new Error('Authentication required.');
      error.statusCode = 401;
      throw error;
    }

    const isCustomer = req.user.role === 'customer' && String(booking.customerId) === req.user.userId;
    const workerRecord = await Worker.findOne({ userId: req.user.userId }).lean();
    const isAssignedWorker = req.user.role === 'worker' && workerRecord && String(booking.workerId) === String(workerRecord._id);

    if (req.user.role !== 'admin' && !isCustomer && !isAssignedWorker) {
      const error = new Error('You are not authorized to view this booking.');
      error.statusCode = 403;
      throw error;
    }

    const enrichedBooking = req.user.role === 'worker'
      ? await enrichBookingForWorker(booking, workerRecord)
      : mapBookingToApi(booking);

    return res.status(200).json({
      success: true,
      booking: enrichedBooking,
    });
  } catch (error) {
    return next(error);
  }
};

export const updateBookingStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body || {};

    if (!status) {
      const error = new Error('Status is required.');
      error.statusCode = 400;
      throw error;
    }

    validateBookingStatus(status);

    const currentBooking = await getBookingByIdFromDb(id);

    if (!currentBooking) {
      return res.status(404).json({
        success: false,
        message: `Booking not found: ${id}`,
      });
    }

    if (!req.user || !req.user.userId) {
      const error = new Error('Authentication required.');
      error.statusCode = 401;
      throw error;
    }

    const isCustomer = req.user.role === 'customer' && String(currentBooking.customerId) === req.user.userId;
    const workerRecord = await Worker.findOne({ userId: req.user.userId }).lean();
    const isAssignedWorker = req.user.role === 'worker' && workerRecord && String(currentBooking.workerId) === String(workerRecord._id);

    if (req.user.role === 'customer') {
      if (!isCustomer || status !== 'cancelled') {
        const error = new Error('Customers can only cancel their own bookings.');
        error.statusCode = 403;
        throw error;
      }
    } else if (req.user.role === 'worker') {
      if (!isAssignedWorker) {
        const error = new Error('You are not assigned to this booking.');
        error.statusCode = 403;
        throw error;
      }
    } else if (req.user.role !== 'admin') {
      const error = new Error('You are not authorized to update this booking status.');
      error.statusCode = 403;
      throw error;
    }

    const booking = await updateBookingStatusInDb(id, status);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: `Booking not found: ${id}`,
      });
    }

    if (status === 'accepted') {
      await createBookingNotification({
        recipientId: currentBooking.customerId,
        recipientRole: 'customer',
        type: 'BOOKING_ACCEPTED',
        title: 'Booking accepted',
        message: 'Your service booking has been accepted by the worker.',
        bookingId: booking._id,
      });
    }

    if (status === 'in_progress') {
      await createBookingNotification({
        recipientId: currentBooking.customerId,
        recipientRole: 'customer',
        type: 'SERVICE_STARTED',
        title: 'Service started',
        message: 'Your worker has started the service.',
        bookingId: booking._id,
      });
    }

    if (status === 'completed') {
      await createBookingNotification({
        recipientId: currentBooking.customerId,
        recipientRole: 'customer',
        type: 'SERVICE_COMPLETED',
        title: 'Service completed',
        message: 'Your service has been completed.',
        bookingId: booking._id,
      });
    }

    if (status === 'cancelled') {
      const targetWorker = await Worker.findById(currentBooking.workerId).lean();
      if (req.user.role === 'customer') {
        if (targetWorker && targetWorker.userId) {
          await createBookingNotification({
            recipientId: targetWorker.userId,
            recipientRole: 'worker',
            type: 'BOOKING_CANCELLED',
            title: 'Booking cancelled',
            message: 'A customer has cancelled the booking.',
            bookingId: booking._id,
          });
        }
      } else if (targetWorker && targetWorker.userId) {
        await createBookingNotification({
          recipientId: currentBooking.customerId,
          recipientRole: 'customer',
          type: 'BOOKING_CANCELLED',
          title: 'Booking cancelled',
          message: 'Your service booking has been cancelled.',
          bookingId: booking._id,
        });
      }
    }

    const enrichedBooking = req.user.role === 'worker'
      ? await enrichBookingForWorker(booking, workerRecord)
      : mapBookingToApi(booking);

    return res.status(200).json({
      success: true,
      booking: enrichedBooking,
    });
  } catch (error) {
    return next(error);
  }
};
