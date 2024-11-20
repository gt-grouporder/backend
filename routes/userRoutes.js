const express = require('express');
const router = express.Router();
const { secret_key } = require('../config');
const { User } = require('../models');
const { ssha256, comparePassword } = require('../utils/hashing');
const jwt = require('jsonwebtoken');

// API to input user data into the database
router.post('/signup', async (req, res) => {
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

router.post('/login', async (req, res) => {
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
    console.error('Error logging in:', error);
  }
});

// helper function to generate access token
function generateAccessToken(_id, username) {
  const user = { _id, username, role: 'user' };
  return jwt.sign(user, secret_key, { expiresIn: '1800s' });
}

module.exports = router;