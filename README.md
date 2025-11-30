# Central Clube Backend Security Implementation

## Deployment Instructions

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure Environment:**
   - Set up your `.env` file with database credentials and JWT secret.
   - To disable maintenance mode, set `MAINTENANCE_MODE=false` in `.env` or `config/config.js`.

3. **Run SQL Migration:**
   - Apply the migration script in `migration.sql` to update your database schema.

4. **Start the server:**
   ```bash
   npm start
   ```

5. **Verify Security:**
   - See `TESTING.md` for step-by-step security checks.

## Key Features
- Maintenance mode (default ON)
- Strict rate limiting
- Payment verification for reservations
- Privacy-protected endpoints
- Admin-only routes
- Helmet, CORS, request logging, and error handling

## File Overview
- `middleware/security.js`: All security middleware
- `routes/admin.js`: Admin-only endpoints
- `routes/reservation.routes.js`: Privacy-protected reservation endpoints
- `config/config.js`: Maintenance mode and CORS settings
- `README.md`: Deployment instructions
- `TESTING.md`: Security test checklist
- `migration.sql`: SQL migration script
