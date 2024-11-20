const express = require('express');
const router = express.Router();
const { Order, User } = require('../models');
const { authenticateToken } = require('../middleware/authenticateToken');

router.post('/addCollaborator', authenticateToken, async (req, res) => {
  const orderId = req.body.orderId;
  const collaboratorUsername = req.body.collaboratorUsername;
  if (!orderId || !collaboratorUsername) {
    return res.status(400).send('Order ID and collaborator username are required');
  }
  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).send('Order not found');
    }
    if (!order.userIds.includes(req.user._id)) {
      return res.status(403).send('Unauthorized');
    }

    const collaborator = await User.findOne({ username: collaboratorUsername });
    if (!collaborator) {
      return res.status(404).send('Collaborator not found');
    }

    if (order.userIds.includes(collaborator._id)) {
      return res.status(409).send('Collaborator already added');
    }

    order.userIds.push(collaborator._id);
    await order.save();
    collaborator.orders.push(orderId);
    await collaborator.save();
    res.status(200).send('Collaborator added successfully');
  } catch (error) {
    console.error('Error adding collaborator:', error);
    res.status(500).send('Internal server error');
  }
});

// API to remove a collaborator from an order
router.delete('/removeCollaborator', authenticateToken, async (req, res) => {
  const orderId = req.body.orderId;
  const collaboratorUsername = req.body.collaboratorUsername;
  if (!orderId || !collaboratorUsername) {
    return res.status(400).send('Order ID and collaborator username are required');
  }
  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).send('Order not found');
    }
    if (!order.userIds.includes(req.user._id)) {
      return res.status(403).send('Unauthorized');
    }

    const collaborator = await User.findOne({ username: collaboratorUsername });
    if (!collaborator) {
      return res.status(404).send('Collaborator not found');
    }

    if (!order.userIds.includes(collaborator._id)) {
      return res.status(409).send('Collaborator not found in order');
    }

    order.userIds.pull(collaborator._id);
    await order.save();
    collaborator.orders.pull(orderId);
    await collaborator.save();
    res.status(200).send('Collaborator removed successfully');
  } catch (error) {
    console.error('Error removing collaborator:', error);
    res.status(500).send('Internal server error');
  }
});

module.exports = router;