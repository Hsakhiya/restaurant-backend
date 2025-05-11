const mongoose = require("mongoose");

const tableSchema = new mongoose.Schema({
  number: { type: String, required: true, unique: true },
  status: { type: String, default: "active" }, // active/inactive
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Table", tableSchema);
