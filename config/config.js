// config/config.js
module.exports = {
  MAINTENANCE_MODE: process.env.MAINTENANCE_MODE !== 'false', // default ON
  ALLOWED_ORIGINS: ['https://central-clube.com', 'https://admin.central-clube.com'],
};
