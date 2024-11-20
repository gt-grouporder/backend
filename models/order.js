const mongoose = require('./mongodb');

const itemSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
    unique: true
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
});

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
    type: [itemSchema],
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

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;