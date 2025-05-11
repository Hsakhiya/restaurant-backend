// models/MenuItem.js
const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  availability: { type: Boolean, required: true },
  description: String,
  price: Number,
  image: String,
  jainAvailable: Boolean
});

module.exports = mongoose.model('MenuItem', menuItemSchema);
