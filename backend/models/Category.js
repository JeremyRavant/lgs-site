const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  title: String,
  description: String,
  cover: String
});

module.exports = mongoose.model('Category', categorySchema);
