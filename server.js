const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ✅ MongoDB Connection with Debugging
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

mongoose.connection.on("error", (err) => {
  console.error("❌ MongoDB Error:", err);
});
mongoose.connection.once("open", () => {
  console.log("✅ MongoDB Connection Verified");
});

// 🛠 User Schema
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
});

const User = mongoose.model("User", userSchema);

// 🛍️ Cart Schema
const cartSchema = new mongoose.Schema({
  userId: String,
  items: [
    {
      id: String,
      name: String,
      price: Number,
      image: String,
      quantity: Number,
    },
  ],
});

const Cart = mongoose.model("Cart", cartSchema);

// 🔐 Middleware to verify JWT
const verifyToken = (req, res, next) => {
  const token = req.header("Authorization");
  if (!token) return res.status(401).json({ message: "Access Denied" });

  try {
    const verified = jwt.verify(
      token.replace("Bearer ", ""),
      process.env.JWT_SECRET
    );
    req.user = verified;
    next();
  } catch (error) {
    res.status(400).json({ message: "Invalid Token" });
  }
};

// ✅ Register New User
app.post("/api/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    res.json({ message: "User registered successfully" });
  } catch (error) {
    console.error("❌ Signup Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ User Login
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "2h",
    });
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Fetch User Cart
app.get("/api/cart", verifyToken, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) return res.json([]);

    res.json(cart.items);
  } catch (error) {
    console.error("❌ Error fetching cart:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ Add Item to Cart
app.post("/api/cart", verifyToken, async (req, res) => {
  const { id, name, price, image, quantity } = req.body;

  try {
    let cart = await Cart.findOne({ userId: req.user.id });

    if (!cart) {
      cart = new Cart({
        userId: req.user.id,
        items: [{ id, name, price, image, quantity }],
      });
    } else {
      const existingItem = cart.items.find((item) => item.id === id);
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.items.push({ id, name, price, image, quantity });
      }
    }

    await cart.save();
    res.json({ message: "Item added to cart successfully", cart });
  } catch (error) {
    console.error("❌ Error adding to cart:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ Update Cart Item Quantity
app.put("/api/cart/:id", verifyToken, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const item = cart.items.find((item) => item.id === req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });

    item.quantity = req.body.quantity;
    await cart.save();
    res.json({ message: "Cart updated", cart });
  } catch (error) {
    console.error("❌ Error updating cart:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ Remove Item from Cart
app.delete("/api/cart/:id", verifyToken, async (req, res) => {
  try {
    let cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.filter((item) => item.id !== req.params.id);
    await cart.save();
    res.json({ message: "Item removed from cart", cart });
  } catch (error) {
    console.error("❌ Error removing cart item:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ Clear Cart
app.delete("/api/cart", verifyToken, async (req, res) => {
  try {
    await Cart.findOneAndDelete({ userId: req.user.id });
    res.json({ message: "Cart cleared" });
  } catch (error) {
    console.error("❌ Error clearing cart:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// 🚀 Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
