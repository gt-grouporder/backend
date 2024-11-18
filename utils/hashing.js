const crypto = require('crypto');

// Function to hash password using SHA-256. Returns hased password.
function sha256(text) {
  return crypto.createHash('sha256').update(text).digest('hex');
}

// Function to hash password using SHA-256 with salt. Default iterations is 10.
// Returns hashed password, salt, and iterations.
function ssha256(text, iterations = 10, salt = '') {
  if (!salt) {
    salt = crypto.randomBytes(8).toString('hex');
  } 
  let hash = sha256(salt + text);
  for (let i = 0; i < iterations; i++) {
    hash = sha256(salt + hash);
  }
  return { hash, salt, iterations };
}

// Function to compare password with hashed password.
// Returns true if password matches, false otherwise.
function comparePassword(text, hash, salt, iterations) {
  return ssha256(text, iterations, salt).hash === hash;
}

// Export the functions for testing
module.exports = { sha256, ssha256, comparePassword };