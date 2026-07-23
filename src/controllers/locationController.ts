import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import prisma from '../prisma';

// Get all saved locations for logged-in user
export const getLocations = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const locations = await prisma.location.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json(locations);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to fetch locations.' });
  }
};

// Add a new saved location
export const addLocation = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { city, label } = req.body;

    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    if (!city) return res.status(400).json({ error: 'City name is required.' });

    const newLocation = await prisma.location.create({
      data: {
        userId,
        city: city.trim(),
        label: label ? label.trim() : 'Saved City',
      },
    });

    return res.status(201).json(newLocation);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to add location.' });
  }
};

// Delete a saved location
export const deleteLocation = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    // Ensure the location belongs to the logged-in user
    const existingLocation = await prisma.location.findFirst({
      where: { id, userId },
    });

    if (!existingLocation) {
      return res.status(404).json({ error: 'Location not found or unauthorized.' });
    }

    await prisma.location.delete({
      where: { id },
    });

    return res.status(200).json({ message: 'Location deleted successfully.' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to delete location.' });
  }
};
