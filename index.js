// index.js

const express = require('express');
const app = express();
const port = 3000;
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');

// get config vars
dotenv.config();

// access config var
process.env.TOKEN_SECRET;

function generateAccessToken(username) {
  return jwt.sign(username, process.env.TOKEN_SECRET, { expiresIn: '1800s' });
}



// Middleware to parse JSON
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Basic route
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

// Example route with parameters
app.get('/hello/:name', (req, res) => {
  const { name } = req.params;
  res.send(`Hello, ${name}!`);
});

app.post('/api/createNewUser', (req, res) => {
  // ...
  console.log(req.body)

  const token = generateAccessToken({ username: req.body.username });
  res.json(token);

  // ...
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
