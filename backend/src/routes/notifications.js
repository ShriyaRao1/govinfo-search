const express = require('express');
const router = express.Router();
const db = require('../config/db');

/**
 * GET /api/notifications/:id
 * Returns the full notification record including pdf_text.
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!/^\d+$/.test(id)) {
      return res.status(400).json({ success: false, message: 'Invalid notification ID' });
    }

    const [rows] = await db.query(
      `SELECT
         id, title, description, department,
         source_url, pdf_text, published_date, created_at
       FROM Notification
       WHERE id = ?
       LIMIT 1`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    return res.json({ success: true, notification: rows[0] });
  } catch (err) {
    console.error('Notification fetch error:', err);
    return res.status(500).json({ success: false, message: 'Could not fetch notification' });
  }
});

module.exports = router;
