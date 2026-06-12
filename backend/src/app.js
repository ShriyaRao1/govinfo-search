const express = require('express');
const cors = require('cors');
require('dotenv').config();

const searchRoutes = require('./routes/search');
const notificationRoutes = require('./routes/notifications');
// Phase 4: auth routes
// Phase 5: admin routes

const app = express();

// ── Middleware ─────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Health check ───────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Routes ─────────────────────────────────────────────────────
app.use('/api/search', searchRoutes);
app.use('/api/notifications', notificationRoutes);
// app.use('/api/auth', authRoutes);      // Phase 4
// app.use('/api/admin', adminRoutes);    // Phase 5

// ── 404 handler ────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} not found` });
});

// ── Global error handler ───────────────────────────────────────
app.use((err, req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

module.exports = app;
