// node scripts/migrate-admin-passwords.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const MONGO_URI = process.env.MONGO_URI || process.env.MONGO_URL || '';
if (!MONGO_URI) throw new Error('MONGO_URI ou MONGO_URL manquant');


const AdminSchema = new mongoose.Schema({
  email: String,
  password: String,      // champ legacy potentiellement présent
  passwordHash: String,
});
const Admin = mongoose.model('Admin', AdminSchema, 'admins');

(async () => {
  await mongoose.connect(MONGO_URL);
  const admins = await Admin.find({ password: { $exists: true, $ne: null } });

  for (const a of admins) {
    if (a.password && !a.passwordHash) {
      const hash = await bcrypt.hash(a.password, 12);
      a.passwordHash = hash;
      a.password = undefined; // supprime le clair
      await a.save();
      console.log(`✅ Migré: ${a.email}`);
    } else if (a.password) {
      a.password = undefined;
      await a.save();
      console.log(`🧹 Nettoyé: ${a.email}`);
    }
  }

  await mongoose.disconnect();
  console.log('🎉 Migration terminée');
  process.exit(0);
})();
