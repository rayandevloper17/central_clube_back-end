// Check actual environment variables
console.log('JWT_SECRET from env:', process.env.JWT_SECRET);
console.log('JWT_SECRET with fallback:', process.env.JWT_SECRET || 'your-secret-key');
console.log('All JWT related env vars:');
console.log('JWT_SECRET:', process.env.JWT_SECRET);
console.log('JWT_REFRESH_SECRET:', process.env.JWT_REFRESH_SECRET);