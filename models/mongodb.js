const mongoose = require('mongoose');
const { uri } = require('../config');

mongoose.connect(uri)
  .catch(err => console.error('Could not connect to MongoDB', err));

module.exports = mongoose;