// index.js

// 1. IMPORT DEPENDENCIES
const express = require('express');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const userCollection = require('./userCollection');
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
    console.log(err);
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// 5. DEFINE HELPER FUNCTIONS
// Function to generate Access Token.
// Expires in 30 minutes.
function generateAccessToken(username) {
  const user = { username, role: 'user' };
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
  const user = {
    username: req.body.username,
    hashedPassword: hash,
    salt: salt,
    iterations: iterations
  };

  try {
    await userCollection.insertMany([user]);
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
    const object = await userCollection.findOne({ username: username })
    console.log(object);

    // If there is not a response object is null

    if (object) {

      const { hashedPassword, salt, iterations } = object;
      const isPasswordMatch = await comparePassword(password, hashedPassword, salt, iterations);

      if (isPasswordMatch) {
        res.status(202).send(generateAccessToken(username));
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

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});