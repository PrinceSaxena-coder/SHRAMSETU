import {
  getAllWorkersFromDb,
  getNearbyWorkersFromDb,
  getWorkerByIdFromDb,
  mapWorkerToApi,
} from '../repositories/workerRepository.js';

function normalizeCategory(value = '') {
  return String(value).trim().toLowerCase();
}

export async function getAllWorkers(req, res, next) {
  try {
    const { category } = req.query;
    const workers = await getAllWorkersFromDb(category);

    return res.status(200).json({
      success: true,
      workers: workers.map(mapWorkerToApi),
    });
  } catch (error) {
    return next(error);
  }
}

export async function getWorkerById(req, res, next) {
  try {
    const { workerId } = req.params;
    const worker = await getWorkerByIdFromDb(workerId);

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: 'Worker not found',
      });
    }

    return res.status(200).json({
      success: true,
      worker: mapWorkerToApi(worker),
    });
  } catch (error) {
    return next(error);
  }
}

export async function getNearbyWorkers(req, res, next) {
  try {
    const { latitude, longitude, radius, category } = req.query;

    if (!latitude || !longitude || !radius) {
      return res.status(400).json({
        success: false,
        message: 'latitude, longitude, and radius are required',
      });
    }

    const requestedLatitude = Number(latitude);
    const requestedLongitude = Number(longitude);
    const requestedRadius = Number(radius);

    if (
      Number.isNaN(requestedLatitude) ||
      Number.isNaN(requestedLongitude) ||
      Number.isNaN(requestedRadius)
    ) {
      return res.status(400).json({
        success: false,
        message: 'latitude, longitude, and radius must be valid numbers',
      });
    }

    const workers = await getNearbyWorkersFromDb({
      latitude: requestedLatitude,
      longitude: requestedLongitude,
      radius: requestedRadius,
      category,
    });

    return res.status(200).json({
      success: true,
      workers,
    });
  } catch (error) {
    return next(error);
  }
}
