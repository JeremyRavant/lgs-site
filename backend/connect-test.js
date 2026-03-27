// connect-test.js
require('dotenv').config();
const mongoose = require('mongoose');

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log('✅ Connexion Mongo OK');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Erreur Mongo :', err.message);
    process.exit(1);
  });
