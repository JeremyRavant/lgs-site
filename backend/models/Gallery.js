const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
  cover: { type: String, required: true },
  description: { type: String },
  category: { type: String, required: true },
  pictures: [{ type: String }]
});

module.exports = mongoose.model('Gallery', gallerySchema);
