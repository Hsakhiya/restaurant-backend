const express = require('express');
const router = express.Router();
const MenuItem = require('../models/MenuItem');

// Get all menu items
router.get('/', async (req, res) => {
  try {
    const items = await MenuItem.find();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all available menu items where availability is true
router.get('/available', async (req, res) => {
  try {
    const availableItems = await MenuItem.find({ availability: true });
    res.json(availableItems);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Add a new menu item
router.post('/', async (req, res) => {
  const { name, category, availability, description, price, image, jainAvailable } = req.body;

  const newMenuItem = new MenuItem({
    name,
    category,
    availability,  // availability is now a boolean
    description,
    price,
    image,
    jainAvailable
  });

  try {
    const savedMenuItem = await newMenuItem.save();
    res.status(201).json(savedMenuItem);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


// PUT /menu/:id - Update full menu item
router.put('/:id', async (req, res) => {
  try {
    const updatedItem = await MenuItem.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updatedItem) return res.status(404).json({ error: 'Item not found' });
    res.json(updatedItem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});




router.patch('/:id/availability', async (req, res) => {
  try {
    const { availability } = req.body;
    const updated = await MenuItem.findByIdAndUpdate(
      req.params.id,
      { availability },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Item not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// DELETE /menu/:id - Delete a menu item
router.delete('/:id', async (req, res) => {
  try {
    const deletedItem = await MenuItem.findByIdAndDelete(req.params.id);

    if (!deletedItem) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    res.status(200).json({ message: 'Menu item deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
