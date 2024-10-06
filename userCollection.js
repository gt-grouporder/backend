// mongodb.js
// Connect to MongoDB and define User schema.

const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();
const uri = process.env.MONGODB_URI;
const localHostURL = "mongodb://localhost:27017"

// Remember to change back to actual database later
mongoose.connect(localHostURL)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error(err));

const userSchema = new mongoose.Schema({
  username:{
    type: String,
    required: true,
    unique: true
  },
  password:{
    type: String,
    required: true
  }
}, { collection: 'users' });

const userCollection = mongoose.model('UserCollection', userSchema);
module.exports = userCollection;
