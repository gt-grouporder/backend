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
  username:{
    type: String,
    required: true,
    unique: true
  },
  hashedPassword:{
    type: String,
    required: true
  },
  salt:{
    type: String,
    required: true
  },
  iterations:{
    type: Number,
    required: true
  },
  ownedOrders:[{
      type: mongoose.Types.ObjectId,
      default: []
  }],
  collabOrders:[{
      type: mongoose.Types.ObjectId,
      default: []
  }]
}, { collection: 'users' });

const User = new mongoose.model('User', userSchema);

// Define Order schema
const orderSchema = new mongoose.Schema({
  userIds: [{
    type: mongoose.Types.ObjectId,
    required: true
  }],
  items: [{ 
    url: String,
    name: String,
    quantity: Number,
    unitPrice: Number
   }],
  totalPrice: { 
    type: Number,
    default: 0,
  },
  createdDate: {
    type: Date,
    default: Date.now()
  }
}, { collection: 'orders'} );

const Order = new mongoose.model('Order', orderSchema);

module.exports = { User, Order };
