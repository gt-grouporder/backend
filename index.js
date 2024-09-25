// index.js

// 1. IMPORT DEPENDENCIES
const express = require('express');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');

const app = express();

// 2. LOAD ENV VARIABLES
dotenv.config();

// 3. INITIALIZE MIDDLEWARE
// Middleware to parse JSON
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));


// 4. DEFINE FUNCTIONS
// Function to generate Access Token
function generateAccessToken(username) {
  return jwt.sign(username, process.env.TOKEN_SECRET, { expiresIn: '1800s' });
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

// Example route to create a new user
app.post('/api/createNewUser', (req, res) => {
  const token = generateAccessToken({ username: req.body.username });
  res.json(token);
});

// Set the port; default to 3000
const PORT = process.env.PORT || 3000;

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
