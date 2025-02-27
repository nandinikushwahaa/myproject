const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Use express.json() instead of body-parser

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// Define Cart Schema
const cartSchema = new mongoose.Schema({
  id: String,
  name: String,
  price: Number,
  image: String,
  quantity: Number,
});

const Cart = mongoose.model("Cart", cartSchema);

// ✅ Get all Cart Items
app.get("/cart", async (req, res) => {
  try {
    const cartItems = await Cart.find();
    res.json(cartItems);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Add Item to Cart (If exists, increase quantity)
app.post("/cart", async (req, res) => {
  try {
    const { id, name, price, image, quantity } = req.body;

    let existingItem = await Cart.findOne({ id });

    if (existingItem) {
      existingItem.quantity += quantity;
      await existingItem.save();
    } else {
      const newItem = new Cart({ id, name, price, image, quantity });
      await newItem.save();
    }

    const updatedCart = await Cart.find(); // Return updated cart
    res.json(updatedCart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Update Cart Item Quantity
app.put("/cart/:id", async (req, res) => {
  try {
    const { quantity } = req.body;

    let item = await Cart.findOne({ id: req.params.id });

    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }

    item.quantity = quantity;
    await item.save();

    const updatedCart = await Cart.find();
    res.json(updatedCart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Remove a Specific Item from Cart
app.delete("/cart/:id", async (req, res) => {
  try {
    const deletedItem = await Cart.findOneAndDelete({ id: req.params.id });

    if (!deletedItem) {
      return res.status(404).json({ error: "Item not found" });
    }

    const updatedCart = await Cart.find();
    res.json(updatedCart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Clear Entire Cart
app.delete("/cart", async (req, res) => {
  try {
    await Cart.deleteMany({});
    res.json({ message: "Cart cleared", cart: [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start Server
const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
