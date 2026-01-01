import jwt from 'jsonwebtoken';

// Use the same secret as the backend
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Create a test token for user ID 302 (the actual test user)
const testToken = jwt.sign(
  { id: 302, email: 'testuser@example.com' },
  JWT_SECRET,
  { expiresIn: '15m' }
);

console.log('Test JWT Token:');
console.log(testToken);
console.log('\nYou can use this token to test the SSE endpoint:');
console.log(`curl -H "Accept: text/event-stream" "http://localhost:3001/api/credits/stream?token=${testToken}"`);
console.log(`\nOr test with the HTML page: http://localhost:3001/test-sse.html?token=${testToken}`);