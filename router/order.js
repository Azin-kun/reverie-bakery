const express = require("express");
const app = express();
const { sequelize, Order, OrderDetail, Product } = require("../models");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// verify token
const verifyToken = require("./verifyToken");
app.use(verifyToken);

// Get all orders
app.get("/", async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [{ model: OrderDetail, include: [Product] }],
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/:order_id", async (req, res) => {
    try {
      const { order_id } = req.params;
  
      const order = await Order.findByPk(order_id, {
        include: [{ model: OrderDetail, include: [Product] }],
      });
  
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
  
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

// Create a new order
app.post("/", async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { user_id, order_date, status, products } = req.body;

    // Check if all products exist
    for (const product of products) {
      const existingProduct = await Product.findByPk(product.product_id);
      if (!existingProduct) {
        throw new Error(`Product with id ${product.product_id} does not exist`);
      }
    }

    const newOrder = await Order.create(
      {
        user_id,
        order_date,
        status,
        total_amount: 0, // Initialize with 0, will be updated later
      },
      { transaction }
    );

    let totalAmount = 0;
    const orderDetails = products.map((product) => {
      totalAmount += product.quantity * product.price;
      return {
        order_id: newOrder.order_id,
        product_id: product.product_id,
        quantity: product.quantity,
        price: product.price,
      };
    });

    await OrderDetail.bulkCreate(orderDetails, { transaction });

    newOrder.total_amount = totalAmount;
    await newOrder.save({ transaction });

    await transaction.commit();

    res.json({
      message: "Order created successfully",
      data: newOrder,
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ message: error.message });
  }
});

// Update an order
app.put("/", async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { order_id, user_id, order_date, status, products } = req.body;

    const order = await Order.findByPk(order_id, { transaction });

    if (!order) {
      await transaction.rollback();
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if all products exist
    for (const product of products) {
      const existingProduct = await Product.findByPk(product.product_id);
      if (!existingProduct) {
        throw new Error(`Product with id ${product.product_id} does not exist`);
      }
    }

    order.user_id = user_id;
    order.order_date = order_date;
    order.status = status;
    await order.save({ transaction });

    await OrderDetail.destroy({ where: { order_id }, transaction });

    let totalAmount = 0;
    const orderDetails = products.map((product) => {
      totalAmount += product.quantity * product.price;
      return {
        order_id: order.order_id,
        product_id: product.product_id,
        quantity: product.quantity,
        price: product.price,
      };
    });

    await OrderDetail.bulkCreate(orderDetails, { transaction });

    order.total_amount = totalAmount;
    await order.save({ transaction });

    await transaction.commit();

    res.json({
      message: "Order updated successfully",
      data: order,
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ message: error.message });
  }
});

// Delete an order
app.delete("/:order_id", async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { order_id } = req.params;

    await OrderDetail.destroy({ where: { order_id }, transaction });
    await Order.destroy({ where: { order_id }, transaction });

    await transaction.commit();

    res.json({
      message: "Order deleted successfully",
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ message: error.message });
  }
});

module.exports = app;
