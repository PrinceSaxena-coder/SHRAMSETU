import mongoose from 'mongoose';

import Service from '../models/Service.js';

const DEFAULT_ICONS = {
  electrical: 'Zap',
  plumbing: 'Droplets',
  carpentry: 'Hammer',
  painting: 'Paintbrush',
  cleaning: 'Sparkles',
  caregiving: 'HeartHandshake',
  appliance: 'Wrench',
};

const DEFAULT_DURATIONS = {
  electrical: '30-60 mins',
  plumbing: '30-60 mins',
  carpentry: '1-2 hrs',
  painting: '2-4 hrs',
  cleaning: '2-3 hrs',
  caregiving: '1-2 hrs',
  appliance: '45-90 mins',
};

function normalizeCategory(value = '') {
  return String(value).trim().toLowerCase();
}

export async function getAllServicesFromDb() {
  return Service.find({ isActive: true }).sort({ category: 1, name: 1 }).lean();
}

export async function getServiceByIdFromDb(serviceId) {
  if (!mongoose.Types.ObjectId.isValid(serviceId)) {
    return null;
  }

  return Service.findById(serviceId).lean();
}

export function mapServiceToApi(service) {
  const category = String(service.category || '').trim();
  const normalizedCategory = normalizeCategory(category);

  return {
    id: String(service._id),
    category: normalizedCategory || 'general',
    name: service.name,
    description: service.description || '',
    basePrice: Number(service.basePrice || 0),
    duration: service.duration || DEFAULT_DURATIONS[normalizedCategory] || '1-2 hrs',
    icon: service.icon || DEFAULT_ICONS[normalizedCategory] || 'Wrench',
  };
}
