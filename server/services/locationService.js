const GEOAPIFY_BASE_URL = 'https://api.geoapify.com';

export function isValidLatitude(latitude) {
  const value = Number(latitude);
  return Number.isFinite(value) && value >= -90 && value <= 90;
}

export function isValidLongitude(longitude) {
  const value = Number(longitude);
  return Number.isFinite(value) && value >= -180 && value <= 180;
}

function getGeoapifyApiKey() {
  const apiKey = process.env.GEOAPIFY_API_KEY;

  if (typeof apiKey !== 'string' || !apiKey.trim()) {
    const error = new Error('Geoapify API key is not configured.');
    error.statusCode = 500;
    throw error;
  }

  return apiKey.trim();
}

async function fetchGeoapifyJson(pathname, params = {}, timeoutMs = 15000) {
  const url = new URL(`${GEOAPIFY_BASE_URL}${pathname}`);
  const apiKey = getGeoapifyApiKey();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }

    url.searchParams.set(key, String(value));
  });

  url.searchParams.set('apiKey', apiKey);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      signal: controller.signal,
    });

    const responseText = await response.text();

    if (!response.ok) {
      const error = new Error('Geoapify request failed.');
      error.statusCode = response.status || 502;
      throw error;
    }

    if (!responseText) {
      const error = new Error('Geoapify returned an empty response.');
      error.statusCode = 502;
      throw error;
    }

    return JSON.parse(responseText);
  } catch (error) {
    if (error.name === 'AbortError') {
      const timeoutError = new Error('Geoapify request timed out.');
      timeoutError.statusCode = 504;
      throw timeoutError;
    }

    if (error instanceof SyntaxError) {
      const parseError = new Error('Geoapify returned an invalid response.');
      parseError.statusCode = 502;
      throw parseError;
    }

    throw error;
  } finally {
    clearTimeout(timer);
  }
}

export function calculateDistance(lat1, lon1, lat2, lon2) {
  const toRadians = (value) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusKm * c;
}

export async function getCoordinatesFromAddress(address) {
  const normalizedAddress = String(address || '').trim();

  if (!normalizedAddress) {
    const error = new Error('Address is required to find coordinates.');
    error.statusCode = 400;
    throw error;
  }

  const payload = await fetchGeoapifyJson('/v1/geocode/search', {
    text: normalizedAddress,
  });

  const features = Array.isArray(payload?.features) ? payload.features : [];
  const match = features[0];

  if (!match || !Array.isArray(match.geometry?.coordinates)) {
    const error = new Error('Unable to find coordinates for the provided address.');
    error.statusCode = 404;
    throw error;
  }

  const [longitude, latitude] = match.geometry.coordinates;

  if (!isValidLatitude(latitude) || !isValidLongitude(longitude)) {
    const error = new Error('Unable to find coordinates for the provided address.');
    error.statusCode = 404;
    throw error;
  }

  return {
    latitude: Number(latitude),
    longitude: Number(longitude),
    formattedAddress: match.properties?.formatted || match.properties?.name || normalizedAddress,
  };
}

export async function getAddressFromCoordinates(latitude, longitude) {
  if (!isValidLatitude(latitude) || !isValidLongitude(longitude)) {
    const error = new Error('Latitude and longitude must be valid geographic coordinates.');
    error.statusCode = 400;
    throw error;
  }

  const payload = await fetchGeoapifyJson('/v1/geocode/reverse', {
    lat: Number(latitude),
    lon: Number(longitude),
  });

  const features = Array.isArray(payload?.features) ? payload.features : [];
  const match = features[0];

  if (!match) {
    const error = new Error('Unable to resolve a readable address for the provided coordinates.');
    error.statusCode = 404;
    throw error;
  }

  return {
    latitude: Number(latitude),
    longitude: Number(longitude),
    formattedAddress: match.properties?.formatted || match.properties?.name || 'Address unavailable',
  };
}

export async function calculateRoute(origin, destination) {
  const originLatitude = Number(origin?.latitude);
  const originLongitude = Number(origin?.longitude);
  const destinationLatitude = Number(destination?.latitude);
  const destinationLongitude = Number(destination?.longitude);

  if (!isValidLatitude(originLatitude) || !isValidLongitude(originLongitude)) {
    const error = new Error('Origin coordinates are invalid.');
    error.statusCode = 400;
    throw error;
  }

  if (!isValidLatitude(destinationLatitude) || !isValidLongitude(destinationLongitude)) {
    const error = new Error('Destination coordinates are invalid.');
    error.statusCode = 400;
    throw error;
  }

  const payload = await fetchGeoapifyJson('/v1/routing', {
    waypoints: `${originLatitude},${originLongitude}|${destinationLatitude},${destinationLongitude}`,
    mode: 'drive',
    units: 'metric',
  });

  const feature = Array.isArray(payload?.features) ? payload.features[0] : null;
  const properties = feature?.properties || {};

  if (!feature || !properties) {
    const error = new Error('Unable to calculate a route for the provided coordinates.');
    error.statusCode = 404;
    throw error;
  }

  const distanceMeters = Number(properties.distance || 0);
  const durationSeconds = Number(properties.time || 0);
  const distanceKm = distanceMeters / 1000;

  return {
    origin: {
      latitude: originLatitude,
      longitude: originLongitude,
    },
    destination: {
      latitude: destinationLatitude,
      longitude: destinationLongitude,
    },
    distanceKm: Number(distanceKm.toFixed(2)),
    distanceMeters: Number(distanceMeters.toFixed(0)),
    durationSeconds: Number(durationSeconds.toFixed(0)),
    durationMinutes: Number((durationSeconds / 60).toFixed(2)),
    route: properties,
  };
}
