import express from 'express';

import {
  geocodeAddress,
  getRoute,
  reverseGeocode,
} from '../controllers/locationController.js';

const router = express.Router();

router.get('/geocode', geocodeAddress);
router.get('/reverse-geocode', reverseGeocode);
router.get('/route', getRoute);

export default router;
