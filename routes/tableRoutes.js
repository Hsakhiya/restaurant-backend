const express = require("express");
const router = express.Router();
const Table = require("../models/Table");

// Add a new table
router.post("/add", async (req, res) => {
  const { number } = req.body;
  if (!number) return res.status(400).json({ message: "Table number is required." });

  try {
    const exists = await Table.findOne({ number });
    if (exists) return res.status(400).json({ message: "Table already exists." });

    const newTable = new Table({ number });
    await newTable.save();
    res.json({ message: "Table added", table: newTable });
  } catch (err) {
    console.error("Error adding table:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// View all tables
router.get("/all", async (req, res) => {
  try {
    const tables = await Table.find().sort({ number: 1 });
    res.json(tables);
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// Check if table exists (for QR scan)
router.get("/check/:number", async (req, res) => {
  const { number } = req.params;

  try {
    const table = await Table.findOne({ number });

    if (!table) {
      return res.status(404).json({ message: "Table not found" });
    }

    // If table is not active, activate it
    if (table.status !== "active") {
      table.status = "active";
      await table.save();
    }

    res.json({ message: "Table valid and activated", table });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});




module.exports = router;