// node -r dotenv/config scripts/unset-admin-legacy-password.js
const mongoose = require('mongoose');

(async () => {
  const uri = process.env.MONGO_URI || process.env.MONGO_URL || '';
  if (!uri) throw new Error('MONGO_URI/MONGO_URL manquant');

  await mongoose.connect(uri);
  const res = await mongoose.connection.db.collection('admins').updateMany(
    { password: { $exists: true } },
    { $unset: { password: "" } }
  );
  console.log(`🧹 Champs 'password' supprimés sur ${res.modifiedCount} document(s).`);
  await mongoose.disconnect();
  process.exit(0);
})();
