// index.js

// 1. IMPORT DEPENDENCIES
const express = require('express');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const { User, Order } = require('./models');
const { ssha256, comparePassword } = require('./utils/hashing');

const app = express();
dotenv.config();

// 2. LOAD ENV VARIABLES
const secret_token = process.env.TOKEN_SECRET;
const port = process.env.PORT || 3000;

// 3. INITIALIZE MIDDLEWARE
// Middleware to parse JSON
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 4. DEFINE CUSTOM MIDDLWARE
// Custom Middleware to authenticate Access Token.
// If valid, the username will be stored in req.user
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, secret_token, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// 5. DEFINE HELPER FUNCTIONS
// Function to generate Access Token.
// Expires in 30 minutes.
function generateAccessToken(_id, username) {
  const user = { _id, username, role: 'user' };
  return jwt.sign(user, secret_token, { expiresIn: '1800s' });
}

// 6. DEFINE ROUTES
// Basic route
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

// Example route with parameters
app.get('/hello/:name', (req, res) => {
  const { name } = req.params;
  res.send(`Hello, ${name}!`);
});

// Example route to create a new user. This route will return a token
app.post('/api/createNewUser', (req, res) => {
  const token = generateAccessToken(req.body.username);
  res.json(token);
});

// Example route to authenticate token and return user details.
app.get('/api/userOrder', authenticateToken, (req, res) => {
  res.json(req.user);
});

// API to input user data into the database
app.post('/api/signup', async (req, res) => {
  const { hash, salt, iterations } = ssha256(req.body.password);
  try {
    await User.create({
      username: req.body.username,
      hashedPassword: hash,
      salt: salt,
      iterations: iterations
    });
    res.status(201).send('User created successfully');
  } catch (error) {
    if (error.code === 11000) {
      res.status(409).send('Username already exists');
    }
  }
});

// API to look for user data in the database
app.post('/api/login', async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  try {
    const object = await User.findOne({ username: username })
    // If there is not a response object is null
    if (object) {
      const { _id, hashedPassword, salt, iterations } = object;
      const isPasswordMatch = await comparePassword(password, hashedPassword, salt, iterations);

      if (isPasswordMatch) {
        res.status(202).send(generateAccessToken(_id, username));
      } else {
        res.status(400).send('Password does not match');
      }
    } else {
      res.status(400).send('User does not exist');
    }
  } catch (error) {
    res.status(500).send('Internal server error');
  }
});

// API to create an empty order
app.post('/api/createOrder', authenticateToken, async (req, res) => {
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

// API to fetch user's orders. Returns {ownedOrders, collabOrders}
app.get('/api/fetchOrders', authenticateToken, async (req, res) => {
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

// API to delete user's order. Use order ID
app.delete('/api/deleteOrder', authenticateToken, async (req, res) => {
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

    // Remove order from user's list of orders
    const user = await User.findById(req.user._id);
    user.orders.pull(orderId);
    await user.save();

    // Delete order from database
    await Order.findByIdAndDelete(orderId);
    res.status(200).send('Order deleted successfully');
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).send('Internal server error');
  }
});

// API to add a collaborator to an order
app.post('/api/addCollaborator', authenticateToken, async (req, res) => {
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
app.delete('/api/removeCollaborator', authenticateToken, async (req, res) => {
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

// API to save user's order to database
app.post('/api/saveOrder', authenticateToken, async (req, res) => {
  const orderData = req.body.Order;
  if (!orderData || !orderData.items || (!orderData.totalPrice && orderData.totalPrice !== 0)) {
    return res.status(400).send('Order data is incomplete');
  }
  try {
    const user = await User.findOne({
      "username": req.user.username
    })
    await Order.create({
      items: orderData.items,
      totalPrice: orderData.totalPrice,
      orderDate: orderData.orderDate,
      userIds: [user._id]
    });
    res.status(201).send('Order saved successfully');
  } catch (error) {
    console.error('Error saving order:', error);
    res.status(500).send('Internal server error');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});