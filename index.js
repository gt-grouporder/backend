// 1. IMPORT DEPENDENCIES
const express = require('express');
const bodyParser = require('body-parser');
const { userRoutes, orderRoutes, collabRoutes } = require('./routes');

const app = express();
const port = 3000;

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

// 2. INITIALIZE MIDDLEWARE
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 3. USE ROUTES
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/collab', collabRoutes);

// 4. START SERVER
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});