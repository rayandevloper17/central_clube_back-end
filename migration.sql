-- migration.sql
-- Add is_admin column to users
ALTER TABLE utilisateurs ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Add audit_log table
CREATE TABLE IF NOT EXISTS audit_log (
  id SERIAL PRIMARY KEY,
  user_id BIGINT,
  action VARCHAR(255),
  details TEXT,
  ip VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Delete reservations without payment
DELETE FROM reservation WHERE payment_id IS NULL;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_reservation_date ON reservation(date);
CREATE INDEX IF NOT EXISTS idx_reservation_utilisateur ON reservation(id_utilisateur);
CREATE INDEX IF NOT EXISTS idx_payment_user ON paiements(user_id);

-- Update payment table structure if needed
ALTER TABLE paiements ADD COLUMN IF NOT EXISTS used BOOLEAN DEFAULT FALSE;
ALTER TABLE paiements ADD COLUMN IF NOT EXISTS transaction_id VARCHAR(255);
