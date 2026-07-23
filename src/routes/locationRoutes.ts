import { Router } from 'express';
import { getLocations, addLocation, deleteLocation } from '../controllers/locationController';

const router = Router();

router.get('/', getLocations);
router.post('/', addLocation);
router.delete('/:id', deleteLocation);

export default router;
