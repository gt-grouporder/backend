const mongoose = require('./mongodb');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  hashedPassword: {
    type: String,
    required: true
  },
  salt: {
    type: String,
    required: true
  },
  iterations: {
    type: Number,
    required: true
  },
  orders: {
    type: [{
      type: mongoose.Types.ObjectId,
      ref: 'Order'
    }],
    default: []
  }
});

const User = mongoose.model('User', userSchema);
module.exports = User;