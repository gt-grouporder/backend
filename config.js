const dotenv = require('dotenv');
dotenv.config();

const uri = process.env.MONGODB_URI;
const secret_key = process.env.SECRET_KEY;

module.exports = { uri, secret_key };
