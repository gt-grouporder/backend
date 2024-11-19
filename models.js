// mongodb.js
// Connect to MongoDB and define User schema.

const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();
const uri = process.env.MONGODB_URI;

mongoose.connect(uri)
  .catch(err => console.error(err));

// Define User schema
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
}, { collection: 'users' });

// Define Order schema
const orderSchema = new mongoose.Schema({
  userIds: {
    type: [{
      type: mongoose.Types.ObjectId,
      ref: 'User'
    }],
    required: true
  },
  title: {
    type: String,
    default: 'Untitled Order'
  },
  items: {
    type: [{
      url: {
        type: String,
        required: true
      },
      name: {
        type: String,
        required: true
      },
      quantity: {
        type: Number,
        default: 1
      },
      unitPrice: {
        type: Number,
        required: true
      }
    }],
    default: []
  },
  totalPrice: {
    type: Number,
    default: 0,
  },
  complete: {
    type: Boolean,
    default: false
  },
  createdDate: {
    type: Date,
    default: Date.now()
  }
}, { collection: 'orders'} );

// Create models
const User = new mongoose.model('User', userSchema);
const Order = new mongoose.model('Order', orderSchema);

module.exports = { User, Order };
