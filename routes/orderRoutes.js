const express = require('express');
const router = express.Router();
const { Order, User } = require('../models');
const { authenticateToken } = require('../middleware/authenticateToken');

// Define order-related routes here
router.post('/createOrder', authenticateToken, async (req, res) => {
  if (req.user == null) {
    return res.status(401).send('Unauthorized');
  }
  try {
    // Create order
    const order = await Order.create({
      userIds: [req.user._id],
      title: req.body.title
    });

    // Add order to user's list of orders
    const user = await User.findById(req.user._id);
    user.orders.push(order._id);
    await user.save();

    res.status(201).send(order._id);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).send('Internal server error');
  }
});

router.delete('/deleteOrder', authenticateToken, async (req, res) => {
  const orderId = req.body.orderId;
  if (!orderId) {
    return res.status(400).send('Order ID or name is required');
  }
  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).send('Order not found');
    }
    if (!order.userIds.includes(req.user._id)) {
      return res.status(403).send('Unauthorized');
    }

    // Remove order from all user's list of orders
    order.userIds.forEach(async userId => {
      const user = await User.findById(userId);
      user.orders.pull(orderId);
      await user.save();
    });

    // Delete order from database
    await Order.findByIdAndDelete(orderId);
    res.status(200).send('Order deleted successfully');
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).send('Internal server error');
  }
});

router.get('/fetchOrders', authenticateToken, async (req, res) => {
  if (req.user == null) {
    return res.status(401).send('Unauthorized');
  }
  try {
    const user = await User.findById(req.user._id)
      .populate('orders')

    res.status(200).json({
      orders: user.orders
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).send('Internal server error');
  }
});

router.post('/addItem', authenticateToken, async (req, res) => {
  const orderId = req.body.orderId;
  const item = req.body.item;
  if (!orderId || !item) {
    return res.status(400).send('Order ID and item are required');
  }
  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).send('Order not found');
    }
    if (!order.userIds.includes(req.user._id)) {
      return res.status(403).send('Unauthorized');
    }

    order.items.push(item);
    order.totalPrice += calculate_item_price(item.quantity, item.unitPrice);
    await order.save();
    res.status(200).send('Item added successfully');
  } catch (error) {
    console.error('Error adding item:', error);
    res.status(500).send('Internal server error');
  }
});

// API to remove item from order.
router.delete('/deleteItem', authenticateToken, async (req, res) => {
  const orderId = req.body.orderId;
  const itemId = req.body.itemId;
  if (!orderId || !itemId) {
    return res.status(400).send('Order and item ID are required');
  }
  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).send('Order not found');
    }
    if (!order.userIds.includes(req.user._id)) {
      return res.status(403).send('Unauthorized');
    }

    // Check if the item exists in the order
    const itemIndex = order.items.findIndex(item => item._id.toString() === itemId);
    if (itemIndex === -1) {
      return res.status(404).send('Item not found in the order');
    }
    const item = order.items[itemIndex];

    // Remove the item with the specified itemId
    order.totalPrice -= calculate_item_price(item.quantity, item.unitPrice);
    order.items.splice(itemIndex, 1);
    await order.save();
    res.status(200).send('Item removed successfully');
  } catch (error) {
    console.error('Error removing item:', error);
    res.status(500).send('Internal server error');
  }
});

// TODO: Add API to update item information

// Helper function to calculate the total price of an item
function calculate_item_price(quantity, unitPrice) {
  return quantity * unitPrice;
}

module.exports = router;