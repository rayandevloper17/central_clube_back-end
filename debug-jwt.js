import jwt from 'jsonwebtoken';

// Check what JWT_SECRET is actually being used
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-secret-key_refresh';

console.log('JWT_SECRET:', JWT_SECRET);
console.log('JWT_REFRESH_SECRET:', JWT_REFRESH_SECRET);

// Test token creation and verification
const testPayload = { id: 302, email: 'testuser@example.com' };
const testToken = jwt.sign(testPayload, JWT_SECRET, { expiresIn: '15m' });

console.log('\nGenerated token:', testToken);

try {
  const decoded = jwt.verify(testToken, JWT_SECRET);
  console.log('Token verified successfully:', decoded);
} catch (error) {
  console.log('Token verification failed:', error.message);
}