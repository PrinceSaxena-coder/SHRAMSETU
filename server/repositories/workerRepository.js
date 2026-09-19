import mongoose from 'mongoose';

import Worker from '../models/Worker.js';
import { calculateDistance } from '../services/locationService.js';

const CATEGORY_DEFAULT_PRICE = {
  electrical: 260,
  plumbing: 220,
  carpentry: 300,
  cleaning: 180,
  painting: 260,
  caregiving: 400,
  appliance: 280,
};

const CATEGORY_AVATAR = {
  electrical: '#4f46e5',
  plumbing: '#0ea5e9',
  carpentry: '#f59e0b',
  cleaning: '#10b981',
  painting: '#f97316',
  caregiving: '#ec4899',
  appliance: '#3b82f6',
};

function normalizeCategory(value = '') {
  return String(value).trim().toLowerCase();
}

function escapeRegExp(value = '') {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function getAllWorkersFromDb(category) {
  const filters = {};

  if (category) {
    const normalized = normalizeCategory(category);
    filters.serviceCategory = {
      $regex: new RegExp(`^${escapeRegExp(normalized)}$`, 'i'),
    };
  }

  return Worker.find(filters).sort({ rating: -1, name: 1 }).lean();
}

export async function getWorkerByIdFromDb(workerId) {
  if (!mongoose.Types.ObjectId.isValid(workerId)) {
    return null;
  }

  return Worker.findById(workerId).lean();
}

export function mapWorkerToApi(worker, distanceValue = undefined) {
  const category = worker.serviceCategory || 'General';
  const normalizedCategory = normalizeCategory(category);
  const locationText = worker.address || 'Jaipur';

  return {
    id: String(worker._id),
    name: worker.name,
    skill: category,
    category: normalizedCategory,
    rating: Number(worker.rating || 0),
    price: CATEGORY_DEFAULT_PRICE[normalizedCategory] ?? 250,
    avatarColor: CATEGORY_AVATAR[normalizedCategory] ?? '#4f46e5',
    latitude: worker.latitude,
    longitude: worker.longitude,
    isAvailable: worker.isAvailable,
    address: worker.address || '',
    experience: Number(worker.experience || 0),
    location: locationText,
    ...(distanceValue !== undefined ? { distance: Number(distanceValue.toFixed(2)) } : {}),
    ...(worker.latitude !== undefined && worker.longitude !== undefined
      ? {
          coordinates: {
            latitude: worker.latitude,
            longitude: worker.longitude,
          },
        }
      : {}),
  };
}

export async function getNearbyWorkersFromDb({ latitude, longitude, radius, category }) {
  const workers = await getAllWorkersFromDb(category);

  const nearbyWorkers = workers
    .filter((worker) => typeof worker.latitude === 'number' && typeof worker.longitude === 'number')
    .map((worker) => {
      const distance = calculateDistance(
        Number(latitude),
        Number(longitude),
        Number(worker.latitude),
        Number(worker.longitude)
      );

      return {
        worker,
        distance,
      };
    })
    .filter(({ distance }) => distance <= Number(radius))
    .map(({ worker, distance }) => mapWorkerToApi(worker, distance));

  return nearbyWorkers;
}