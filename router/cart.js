// cart.js (backend)
const express = require("express");
const app = express();
const { sequelize, OrderDetail, Product } = require("../models");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// verify token
const verifyToken = require("./verifyToken");
app.use(verifyToken);

// Get cart items for current user
app.get("/", async (req, res) => {
  try {
    const { user_id } = req.user; // assuming you have user_id from token

    const cartItems = await OrderDetail.findAll({
      where: {
        user_id,
      },
      include: [{ model: Product }],
    });

    res.json(cartItems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Remove item from cart
app.delete("/:order_detail_id", async (req, res) => {
  try {
    const { order_detail_id } = req.params;

    await OrderDetail.destroy({ where: { order_detail_id } });

    res.json({
      message: "Item removed from cart successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = app;
