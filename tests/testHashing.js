const { ssha256, comparePassword } = require('../utils/hashing');

// Test the functions
const password = 'mySecurePassword';
const { hash, salt, iterations } = ssha256(password);

console.log('Original Password:', password);
console.log('Hashed Password:', hash);
console.log('Salt:', salt);
console.log('Iterations:', iterations);

// Compare the password
const isMatch = comparePassword(password, hash, salt, iterations);
console.log('Password Match:', isMatch);

// Test with a wrong password
const wrongPassword = 'wrongPassword';
const isWrongMatch = comparePassword(wrongPassword, hash, salt, iterations);
console.log('Wrong Password Match:', isWrongMatch);