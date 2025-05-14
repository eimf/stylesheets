import express from 'express';
import { body, validationResult } from 'express-validator';
import { getDatabase } from '../database/init.js';
import { isValid, parseISO } from 'date-fns';

export const router = express.Router();

// Validation middleware
const validateAppointment = [
  body('client_name').trim().notEmpty().withMessage('Client name is required'),
  body('client_email').isEmail().withMessage('Valid email is required'),
  body('service_id').isInt().withMessage('Valid service ID is required'),
  body('stylist_id').isInt().withMessage('Valid stylist ID is required'),
  body('appointment_date')
    .custom((value) => {
      if (!isValid(parseISO(value))) {
        throw new Error('Invalid appointment date');
      }
      return true;
    })
];

// Get all appointments
router.get('/', async (req, res) => {
  try {
    const db = await getDatabase();
    const appointments = await db.all(`
      SELECT 
        a.*,
        s.name as service_name,
        st.name as stylist_name
      FROM appointments a
      JOIN services s ON a.service_id = s.id
      JOIN stylists st ON a.stylist_id = st.id
    `);
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new appointment
router.post('/', validateAppointment, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const db = await getDatabase();
    const { client_name, client_email, service_id, stylist_id, appointment_date } = req.body;

    const result = await db.run(`
      INSERT INTO appointments (client_name, client_email, service_id, stylist_id, appointment_date)
      VALUES (?, ?, ?, ?, ?)
    `, [client_name, client_email, service_id, stylist_id, appointment_date]);

    res.status(201).json({
      id: result.lastID,
      message: 'Appointment created successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get appointment by ID
router.get('/:id', async (req, res) => {
  try {
    const db = await getDatabase();
    const appointment = await db.get(`
      SELECT 
        a.*,
        s.name as service_name,
        st.name as stylist_name
      FROM appointments a
      JOIN services s ON a.service_id = s.id
      JOIN stylists st ON a.stylist_id = st.id
      WHERE a.id = ?
    `, req.params.id);

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    res.json(appointment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update appointment status
router.patch('/:id/status', async (req, res) => {
  try {
    const db = await getDatabase();
    const { status } = req.body;

    if (!['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    await db.run('UPDATE appointments SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ message: 'Appointment status updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});