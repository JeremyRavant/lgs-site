// scripts/seed-admin.js
require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('../models/Admin');

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    const login = process.argv[2] || 'admin';
    const password = process.argv[3] || 'admin123';

    let admin = await Admin.findOne({ login }).select('+password');
    if (!admin) {
      admin = await Admin.create({ login, password });
      console.log('✅ Admin créé');
    } else {
      admin.password = password; // legacy field → sera hashé par le pre('save')
      await admin.save();
      console.log('✅ Mot de passe mis à jour');
    }
    process.exit(0);
  } catch (e) {
    console.error('❌', e);
    process.exit(1);
  }
})();
