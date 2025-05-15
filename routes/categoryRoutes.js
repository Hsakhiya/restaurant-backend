const express = require("express");
const router = express.Router();
const Category = require("../models/Category");

// GET all categories
router.get("/", async (req, res) => {
  try {
    const categories = await Category.find().sort({ sortOrder: 1 });
    res.json(categories);
  } catch (err) {
    console.error("Failed to fetch categories:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// POST add new category
router.post("/", async (req, res) => {
  const { name, displayName, icon, isVisible, sortOrder } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Category name is required" });
  }

  try {
    const existing = await Category.findOne({ name });
    if (existing) {
      return res.status(400).json({ message: "Category already exists" });
    }

    const category = new Category({
      name,
      displayName: displayName || name,
      icon,
      isVisible,
      sortOrder
    });

    await category.save();
    res.status(201).json(category);
  } catch (err) {
    console.error("Failed to add category:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// DELETE a category by ID
router.delete("/:id", async (req, res) => {
  try {
    const result = await Category.findByIdAndDelete(req.params.id);
    if (!result) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.json({ message: "Category deleted" });
  } catch (err) {
    console.error("Failed to delete category:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// PUT update a category (optional)
router.put("/:id", async (req, res) => {
  try {
    const updated = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.json(updated);
  } catch (err) {
    console.error("Failed to update category:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
