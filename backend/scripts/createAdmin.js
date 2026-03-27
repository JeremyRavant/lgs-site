require('dotenv').config();
const mongoose = require('mongoose');
const readline = require('readline');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');

function ask(question, { hidden = false } = {}) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    if (!hidden) {
      rl.question(question, (answer) => {
        rl.close();
        resolve(answer.trim());
      });
      return;
    }

    const onDataHandler = () => {
      readline.cursorTo(process.stdout, 0);
      process.stdout.write(question + '*'.repeat(rl.line.length));
    };

    process.stdin.on('data', onDataHandler);

    rl.question(question, (answer) => {
      process.stdin.removeListener('data', onDataHandler);
      rl.close();
      process.stdout.write('\n');
      resolve(answer.trim());
    });
  });
}

async function main() {
  try {
    if (!process.env.MONGO_URL) {
      throw new Error('MONGO_URL manquant dans le .env');
    }

    await mongoose.connect(process.env.MONGO_URL);
    console.log('✅ MongoDB connecté');

    const email = (await ask('Email admin : ')).toLowerCase();
    const password = await ask('Mot de passe admin : ', { hidden: true });

    if (!email || !password) {
      throw new Error('Email et mot de passe obligatoires');
    }

    if (password.length < 8) {
      throw new Error('Le mot de passe doit faire au moins 8 caractères');
    }

    const existing = await Admin.findOne({ email });
    if (existing) {
      throw new Error(`Un admin avec l'email "${email}" existe déjà`);
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const admin = new Admin({
      email,
      passwordHash,
      role: 'admin',
    });

    await admin.save();

    console.log(`✅ Admin créé avec succès : ${email}`);
  } catch (err) {
    console.error('❌ Erreur :', err.message);
  } finally {
    await mongoose.disconnect().catch(() => {});
    process.exit(0);
  }
}

main();