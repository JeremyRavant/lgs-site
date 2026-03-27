// routes/admin.js
const express = require('express');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const Admin = require('../models/Admin');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'change-me';

// Limiter les tentatives
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });

router.post('/login', limiter, async (req, res) => {
  try {
    const { login, password } = req.body || {};
    if (!login || !password) {
      return res.status(400).json({ message: 'Champs manquants' });
    }

    // IMPORTANT: on sélectionne explicitement les champs non retournés par défaut
    const admin = await Admin.findOne({ login }).select('+password +passwordHash');
    if (!admin) {
      return res.status(401).json({ message: 'Identifiants incorrects' });
    }

    const ok = await admin.comparePassword(password);
    if (!ok) {
      return res.status(401).json({ message: 'Identifiants incorrects' });
    }

    const token = jwt.sign({ id: admin._id, login: admin.login }, JWT_SECRET, { expiresIn: '2h' });
    res.json({ message: 'Connexion réussie', token });
  } catch (e) {
    console.error('[ADMIN /login] ERROR:', e); // <- log complet côté serveur
    res.status(500).json({ message: 'INTERNAL_ERROR' });
  }
});

module.exports = router;
