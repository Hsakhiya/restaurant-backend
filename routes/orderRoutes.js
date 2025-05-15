const express = require("express");
const router = express.Router();
const Order = require("../models/Order");

// Place a new order (with per-item status)
router.post("/place", async (req, res) => {
  const { tableNumber, order, totalPrice } = req.body;

  if (!tableNumber || !order || !Array.isArray(order) || !totalPrice) {
    return res.status(400).json({ message: "Missing or invalid data." });
  }

  

  try {
    const now = new Date();

    const itemsArray = order.map(item => ({
      name: item.name,
      itemPrice: Number(item.itemPrice),
      status: item.status || "pending",
      category: item.category || "other",
    }));

    const newOrderEntry = {
      timestamp: now,
      items: itemsArray,
      price: Number(totalPrice), // ✅ Ensure this is a Number
    };

    let tableOrder = await Order.findOne({ tableNumber, status: "open" });

    if (tableOrder) {
      tableOrder.orders.push(newOrderEntry);
    } else {
      tableOrder = new Order({
        tableNumber,
        orders: [newOrderEntry],
        createdAt: now,
        updatedAt: now,
      });
    }

    await tableOrder.save();
    res.json({ message: "Order stored successfully" });
  } catch (err) {
    console.error("Error placing order:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});


// Get all orders
router.get("/all", async (req, res) => {
  try {
    const orders = await Order.find().sort({ updatedAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get items summary for a table
router.get("/items/:tableNumber", async (req, res) => {
  const { tableNumber } = req.params;

  try {
    const tableOrder = await Order.findOne({ tableNumber }).lean();

    if (!tableOrder) {
      return res.status(404).json({ message: "No orders found for this table" });
    }

    const allItems = tableOrder.orders.flatMap(entry => entry.items);
    const totalPrice = tableOrder.orders.reduce((sum, entry) => sum + entry.price, 0);

    const mergedItems = {};
    for (const item of allItems) {
      if (!mergedItems[item.name]) {
        mergedItems[item.name] = { quantity: 0, statuses: [] };
      }
      mergedItems[item.name].quantity += 1;
      mergedItems[item.name].statuses.push(item.status);
    }

    res.json({ items: mergedItems, totalPrice });
  } catch (err) {
    console.error("Error fetching ordered items for table:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});



// Get orders grouped by table, filtered by pending status
router.get("/by-table", async (req, res) => {
  try {
    const orders = await Order.find({
      "orders.items.status": { $in: ["pending", "preparing"] }
    }).sort({ updatedAt: -1 });

    const ordersByTable = orders.reduce((acc, order) => {
      if (!acc[order.tableNumber]) {
        acc[order.tableNumber] = [];
      }
      acc[order.tableNumber].push(order);
      return acc;
    }, {});

    res.json(ordersByTable);
  } catch (err) {
    console.error("Error fetching active kitchen orders:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});
// Get detailed order history for a table
router.get("/details/:tableNumber", async (req, res) => {
  const { tableNumber } = req.params;

  try {
    const tableOrder = await Order.findOne({ tableNumber }).lean();

    if (!tableOrder) {
      return res.status(404).json({ message: "No orders found for this table" });
    }

    const orders = tableOrder.orders.map(entry => ({
      timestamp: entry.timestamp,
      items: entry.items.map(item => ({
        name: item.name,
        quantity: 1, // Each item is stored as a single unit, so the quantity will always be 1
        status: item.status
      })),
      price: entry.price
    }));

    const totalPrice = orders.reduce((sum, entry) => sum + entry.price, 0);

    res.json({ orders, totalPrice });
  } catch (err) {
    console.error("Error fetching order details:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});


// PATCH /orders/update-status
router.patch("/update-status", async (req, res) => {
  const { itemId, newStatus } = req.body;

  if (!itemId || !newStatus) {
    return res.status(400).json({ message: "Missing fields." });
  }

  try {
    const orderDoc = await Order.findOne({ "orders.items._id": itemId });

    if (!orderDoc) {
      return res.status(404).json({ message: "Item not found." });
    }

    let updated = false;

    for (const orderEntry of orderDoc.orders) {
      for (const item of orderEntry.items) {
        if (item._id.toString() === itemId) {
          item.status = newStatus;
          updated = true;
          break;
        }
      }
      if (updated) break;
    }

    if (updated) {
      await orderDoc.save();
      res.json({ message: "Item status updated." });
    } else {
      res.status(404).json({ message: "Item not found for update." });
    }
  } catch (err) {
    console.error("Error updating item status:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// GET /orders/pending-preparing-items?category=South%20Indian
router.get("/pending-preparing-items", async (req, res) => {
  try {
    const { category } = req.query;

    const filter = {
      "orders.items": {
        $elemMatch: {
          status: { $in: ["pending", "preparing"] },
          ...(category ? { category: category } : {}),
        },
      },
    };

    const orders = await Order.find(filter).lean();

    const pendingPreparingItems = [];

    for (const order of orders) {
      for (const entry of order.orders) {
        for (const item of entry.items) {
          if (
            ["pending", "preparing"].includes(item.status) &&
            (!category || item.category === category)
          ) {
            pendingPreparingItems.push({
              _id: item._id,
              name: item.name,
              status: item.status,
              category: item.category,
              tableNumber: order.tableNumber,
              orderTimestamp: entry.timestamp,
            });
          }
        }
      }
    }

    res.json(pendingPreparingItems);
  } catch (err) {
    console.error("Error fetching pending & preparing items:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});



module.exports = router;
