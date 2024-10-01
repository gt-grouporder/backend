// index.js

// 1. IMPORT DEPENDENCIES
const express = require('express');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const userCollection = require('./userCollection');

const app = express();
dotenv.config();

// 2. LOAD ENV VARIABLES
const secret_token = process.env.TOKEN_SECRET;
const port = process.env.PORT || 3000;

// 3. INITIALIZE MIDDLEWARE
// Middleware to parse JSON
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 4. DEFINE FUNCTIONS
// Function to generate Access Token
function generateAccessToken(username) {
  const user = { username, role: 'user' };
  return jwt.sign(user, secret_token, { expiresIn: '1800s' });
}

// Function to authenticate Aceess Token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, secret_token, (err, user) => {
    console.log(err);
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// 5. DEFINE ROUTES
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
  const user = {
    username: req.body.username,
    password: req.body.password
  };

  try {
    await userCollection.insertMany([user]);
    res.status(201).send('User created successfully');
  } catch (error) {
    res.status(500).send('Error creating user');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
