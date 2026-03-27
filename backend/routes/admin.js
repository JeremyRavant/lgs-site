const express = require('express');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const Admin = require('../models/Admin');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'change-me';

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });

router.post('/login', limiter, async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: 'Champs manquants' });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase() }).select('+passwordHash');
    if (!admin) {
      return res.status(401).json({ message: 'Identifiants incorrects' });
    }

    const ok = await admin.comparePassword(password);
    if (!ok) {
      return res.status(401).json({ message: 'Identifiants incorrects' });
    }

    const token = jwt.sign(
      { id: admin._id, email: admin.email, role: admin.role },
      JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.json({ message: 'Connexion réussie', token });
  } catch (e) {
    console.error('[ADMIN /login] ERROR:', e);
    res.status(500).json({ message: 'INTERNAL_ERROR' });
  }
});

module.exports = router;