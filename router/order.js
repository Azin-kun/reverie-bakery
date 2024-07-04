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

// Get an order by order_id
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

// Create a new order (add products to cart)
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

app.post("/add-to-cart", async (req, res) => {
  const { user_id, product_id, quantity, price } = req.body;

  try {
    if (!user_id) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const existingProduct = await Product.findByPk(product_id);
    if (!existingProduct) {
      return res.status(404).json({ message: `Product with id ${product_id} does not exist` });
    }

    const order = await Order.findOne({
      where: {
        user_id,
        status: 'cart', // Assuming 'cart' status is used for pending orders
      },
    });

    let orderDetail;
    if (order) {
      orderDetail = await OrderDetail.findOne({
        where: {
          order_id: order.order_id,
          product_id,
        },
      });
    }

    const transaction = await sequelize.transaction();

    try {
      if (orderDetail) {
        orderDetail.quantity += quantity;
        await orderDetail.save({ transaction });
      } else {
        orderDetail = await OrderDetail.create({
          order_id: order ? order.order_id : null,
          product_id,
          quantity,
          price,
        }, { transaction });
      }

      if (!order) {
        const newOrder = await Order.create({
          user_id,
          order_date: new Date(),
          status: 'cart',
          total_amount: price * quantity,
        }, { transaction });

        orderDetail.order_id = newOrder.order_id;
        await orderDetail.save({ transaction });
      } else {
        order.total_amount += price * quantity;
        await order.save({ transaction });
      }

      await transaction.commit();

      res.json({
        message: "Product added to cart successfully",
        data: orderDetail,
      });
    } catch (error) {
      await transaction.rollback();
      throw error; // Let the error be caught by the outer catch block
    }
  } catch (error) {
    console.error("Error adding product to cart:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});



module.exports = app;
