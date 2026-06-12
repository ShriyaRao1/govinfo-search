const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../config/db');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// ── Multer config ──────────────────────────────────────────────
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${Date.now()}-${safe}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed.'));
    }
  },
});

// ── All admin routes require auth + admin role ─────────────────
router.use(authMiddleware, adminMiddleware);

// ── GET /api/admin/stats ───────────────────────────────────────
router.get('/stats', async (req, res) => {
  try {
    const [[{ total_notifications }]] = await db.query(
      'SELECT COUNT(*) AS total_notifications FROM Notification'
    );

    const [[{ total_users }]] = await db.query(
      'SELECT COUNT(*) AS total_users FROM User'
    );

    const [[{ this_week }]] = await db.query(
      `SELECT COUNT(*) AS this_week FROM Notification
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)`
    );

    const [by_department] = await db.query(
      `SELECT department, COUNT(*) AS count
       FROM Notification
       GROUP BY department
       ORDER BY count DESC`
    );

    return res.json({
      success: true,
      stats: {
        total_notifications,
        total_users,
        this_week,
        by_department,
      },
    });
  } catch (err) {
    console.error('Stats error:', err);
    return res.status(500).json({ success: false, message: 'Could not fetch stats.' });
  }
});

// ── POST /api/admin/notifications ─────────────────────────────
router.post('/notifications', upload.single('pdf'), async (req, res) => {
  try {
    const { title, description, department, source_url, published_date } = req.body;

    // Validation
    if (!title || !description || !department || !source_url || !published_date) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    // Extract PDF text if a file was uploaded
    let pdf_text = null;
    if (req.file) {
      try {
        // Lazy-require pdf-parse to avoid issues if no file is provided
        const pdfParse = require('pdf-parse');
        const fileBuffer = fs.readFileSync(req.file.path);
        const pdfData = await pdfParse(fileBuffer);
        pdf_text = pdfData.text || null;
      } catch (pdfErr) {
        console.warn('PDF parse warning:', pdfErr.message);
        // Don't block the insert — just store null for pdf_text
      } finally {
        // Clean up temp file
        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      }
    }

    const [result] = await db.query(
      `INSERT INTO Notification
         (title, description, department, source_url, pdf_text, published_date)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [title.trim(), description.trim(), department.trim(), source_url.trim(), pdf_text, published_date]
    );

    return res.status(201).json({
      success: true,
      message: 'Notification added successfully.',
      id: result.insertId,
      pdf_extracted: pdf_text !== null,
    });
  } catch (err) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    console.error('Add notification error:', err);
    return res.status(500).json({ success: false, message: 'Failed to add notification.' });
  }
});

// ── Multer error handler ───────────────────────────────────────
router.use((err, req, res, _next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ success: false, message: 'PDF file is too large (max 10 MB).' });
  }
  return res.status(400).json({ success: false, message: err.message });
});

module.exports = router;
