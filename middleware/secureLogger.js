// middleware/secureLogger.js
// Only logs API requests for admin or developer users

const DEBUG_LOGGING = process.env.DEBUG_LOGGING === 'true';

function secureLogger(req, res, next) {
  // Assume req.user is set by JWT auth middleware
  const isAdmin = req.user && req.user.role === 'admin';
  const isDeveloper = req.user && req.user.email === 'YOUR_EMAIL_HERE'; // <-- Set your developer email

  if (isAdmin || isDeveloper || DEBUG_LOGGING) {
    // Log request details for admin/developer
    console.log(`[ADMIN/DEV LOG] ${req.method} ${req.originalUrl}`, {
      headers: { ...req.headers, authorization: undefined }, // Hide tokens
      body: req.body
    });
  } else {
    // For regular users, only log minimal info
    // Or comment out to hide completely
    // console.log(`[USER LOG] ${req.method} ${req.originalUrl}`);
  }
  next();
}

module.exports = secureLogger;
