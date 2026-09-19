import { apiRequest } from './apiClient';

/**
 * Resolves a human-readable address for a lat/lng pair.
 * Backed by server/routes/locationRoutes.js -> GET /api/location/reverse-geocode
 */
export async function reverseGeocode(latitude, longitude) {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
  });

  const data = await apiRequest(`/location/reverse-geocode?${params.toString()}`);
  return data.data || null;
}

/**
 * Resolves coordinates for a typed address.
 * Backed by server/routes/locationRoutes.js -> GET /api/location/geocode
 */
export async function geocodeAddress(address) {
  const params = new URLSearchParams({ address });
  const data = await apiRequest(`/location/geocode?${params.toString()}`);
  return data.data || null;
}