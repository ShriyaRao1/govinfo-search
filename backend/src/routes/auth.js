const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// ── Helpers ────────────────────────────────────────────────────

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ── POST /api/auth/register ────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }
    if (name.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Name must be at least 2 characters.' });
    }
    if (!validateEmail(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email address.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    }

    // Check duplicate email
    const [existing] = await db.query(
      'SELECT id FROM User WHERE email = ? LIMIT 1',
      [email.toLowerCase()]
    );
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Insert user
    const [result] = await db.query(
      'INSERT INTO User (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [name.trim(), email.toLowerCase(), password_hash, 'user']
    );

    const user = {
      id: result.insertId,
      name: name.trim(),
      email: email.toLowerCase(),
      role: 'user',
    };

    const token = signToken(user);

    return res.status(201).json({ success: true, message: 'Account created successfully.', token, user });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ success: false, message: 'Registration failed. Please try again.' });
  }
});

// ── POST /api/auth/login ───────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    // Look up user
    const [rows] = await db.query(
      'SELECT id, name, email, password_hash, role FROM User WHERE email = ? LIMIT 1',
      [email.toLowerCase()]
    );

    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const dbUser = rows[0];

    // Verify password
    const passwordMatch = await bcrypt.compare(password, dbUser.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const user = {
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      role: dbUser.role,
    };

    const token = signToken(user);

    return res.json({ success: true, message: 'Login successful.', token, user });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, message: 'Login failed. Please try again.' });
  }
});

module.exports = router;
