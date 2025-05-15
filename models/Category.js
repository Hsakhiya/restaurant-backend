// models/Category.js
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  displayName: { type: String },
  icon: String,
  isVisible: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 }
});

module.exports = mongoose.model('Category', categorySchema);
