import express from 'express';
import { getDatabase } from '../database/init.js';

export const router = express.Router();

// Get all services
router.get('/', async (req, res) => {
  try {
    const db = await getDatabase();
    const services = await db.all('SELECT * FROM services');
    res.json(services);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get service by ID
router.get('/:id', async (req, res) => {
  try {
    const db = await getDatabase();
    const service = await db.get('SELECT * FROM services WHERE id = ?', req.params.id);
    
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    res.json(service);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});