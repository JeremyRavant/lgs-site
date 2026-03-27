// models/Admin.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // <- bcryptjs pour éviter les soucis natifs sous Windows

const AdminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ['admin'], default: 'admin' }
}, { timestamps: true });



// Hash automatique si "password" est présent et modifié
AdminSchema.pre('save', async function (next) {
  try {
    if (this.isModified('password') && this.password) {
      this.passwordHash = await bcrypt.hash(this.password, 12);
      this.password = undefined; // on efface l'ancien champ en clair
    }
    next();
  } catch (e) {
    next(e);
  }
});

AdminSchema.methods.comparePassword = async function (plain) {
  try {
    // On récupère le hash si on l'a
    if (this.passwordHash) {
      return await bcrypt.compare(plain, this.passwordHash);
    }

    // Mode legacy (mot de passe en clair enregistré dans "password")
    if (this.password) {
      const ok = plain === this.password;
      if (ok) {
        // on migre
        this.passwordHash = await bcrypt.hash(plain, 12);
        this.password = undefined;
        await this.save();
      }
      return ok;
    }

    // Rien pour comparer
    return false;
  } catch (_e) {
    // en cas de problème de hash, on renvoie false (au lieu de crasher en 500)
    return false;
  }
};

module.exports = mongoose.model('Admin', AdminSchema);
