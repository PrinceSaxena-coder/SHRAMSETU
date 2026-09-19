import {
  getAllServicesFromDb,
  getServiceByIdFromDb,
  mapServiceToApi,
} from '../repositories/serviceRepository.js';

export const getAllServices = async (req, res, next) => {
  try {
    const services = await getAllServicesFromDb();

    return res.status(200).json({
      success: true,
      services: services.map(mapServiceToApi),
    });
  } catch (error) {
    return next(error);
  }
};

export const getServiceById = async (req, res, next) => {
  try {
    const { serviceId } = req.params;
    const service = await getServiceByIdFromDb(serviceId);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: `Service not found: ${serviceId}`,
      });
    }

    return res.status(200).json({
      success: true,
      service: mapServiceToApi(service),
    });
  } catch (error) {
    return next(error);
  }
};
