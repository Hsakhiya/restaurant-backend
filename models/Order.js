const mongoose = require("mongoose");

// Schema for each individual item in an order
const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  itemPrice: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'preparing', 'served', 'cancelled'],
    default: 'pending'
  },
  
});

// Schema for each order entry (a set of items placed at one time)
const orderEntrySchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  items: [itemSchema], // Array of items with individual status
  price: { type: Number, required: true}
});

// Schema for full order document per table
const orderSchema = new mongoose.Schema({
  tableNumber: { type: Number, required: true },  // Changed to Number
  orders: [orderEntrySchema], // array of sub-orders (with items)
  status: { type: String, default: "open" }, // open, closed, etc.
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Automatically update `updatedAt` on save
orderSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Order", orderSchema);
