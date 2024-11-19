// mongodb.js
// Connect to MongoDB and define User schema.

const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();
const uri = process.env.MONGODB_URI;

mongoose.connect(uri)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error(err));

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
  }
}, { collection: 'users' });

const orderSchema = new mongoose.Schema({
  items: [{ 
    name: String, 
    quantity: Number, 
    price: Number
   }],
  totalPrice: { 
    type: Number, 
    required: true 
  },
  orderDate: { 
    type: Date, 
    default: Date.now
   },
  userIds: [{
    type: mongoose.Types.ObjectId,
    required: true
  }]
}, { collection: 'orders'} );


const orderCollection = mongoose.model('Order', orderSchema);
const userCollection = mongoose.model('UserCollection', userSchema);

module.exports = { userCollection, orderCollection };
