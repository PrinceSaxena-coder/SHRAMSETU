import {
  calculateRoute,
  getAddressFromCoordinates,
  getCoordinatesFromAddress,
} from '../services/locationService.js';

export async function geocodeAddress(req, res) {
  try {
    const address = typeof req.query.address === 'string' ? req.query.address.trim() : '';

    if (!address) {
      return res.status(400).json({
        success: false,
        message: 'address query parameter is required',
      });
    }

    const result = await getCoordinatesFromAddress(address);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return res.status(error.statusCode || 400).json({
      success: false,
      message: error.message || 'Unable to find coordinates for the provided address',
    });
  }
}

export async function reverseGeocode(req, res) {
  try {
    const latitude = req.query.latitude;
    const longitude = req.query.longitude;

    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        success: false,
        message: 'latitude and longitude query parameters are required',
      });
    }

    const result = await getAddressFromCoordinates(latitude, longitude);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return res.status(error.statusCode || 400).json({
      success: false,
      message: error.message || 'Unable to resolve the address for the provided coordinates',
    });
  }
}

export async function getRoute(req, res) {
  try {
    const originLat = req.query.originLat;
    const originLng = req.query.originLng;
    const destinationLat = req.query.destinationLat;
    const destinationLng = req.query.destinationLng;

    if (
      originLat === undefined ||
      originLng === undefined ||
      destinationLat === undefined ||
      destinationLng === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: 'originLat, originLng, destinationLat, and destinationLng are required',
      });
    }

    const result = await calculateRoute(
      { latitude: originLat, longitude: originLng },
      { latitude: destinationLat, longitude: destinationLng }
    );

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return res.status(error.statusCode || 400).json({
      success: false,
      message: error.message || 'Unable to calculate the route',
    });
  }
}
