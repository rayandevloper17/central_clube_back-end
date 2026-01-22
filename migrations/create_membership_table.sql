-- ═══════════════════════════════════════════════════════════════════════════════
-- Membership Table Creation SQL
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS membership (
  id BIGSERIAL PRIMARY KEY,
  id_user BIGINT NOT NULL REFERENCES utilisateur(id) ON DELETE CASCADE,
  id_club BIGINT NOT NULL,
  dateend DATE NOT NULL,
  typemmbership BIGINT NOT NULL CHECK (typemmbership >= 0 AND typemmbership <= 4),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_membership_user ON membership(id_user);
CREATE INDEX IF NOT EXISTS idx_membership_club ON membership(id_club);
CREATE INDEX IF NOT EXISTS idx_membership_expiry ON membership(dateend);
CREATE INDEX IF NOT EXISTS idx_membership_user_club ON membership(id_user, id_club);

-- Add comments for documentation
COMMENT ON TABLE membership IS 'User membership tiers for clubs';
COMMENT ON COLUMN membership.id IS 'Primary key';
COMMENT ON COLUMN membership.id_user IS 'Foreign key to utilisateur table';
COMMENT ON COLUMN membership.id_club IS 'Club/Terrain ID where membership is valid';
COMMENT ON COLUMN membership.dateend IS 'Membership expiry date';
COMMENT ON COLUMN membership.typemmbership IS 'Membership type: 0=normal, 1=access, 2=gold, 3=platinum, 4=infinity';

-- Insert sample test data (optional - comment out if not needed)
-- INSERT INTO membership (id_user, id_club, dateend, typemmbership) VALUES
-- (1, 1, '2026-12-31', 2), -- Gold membership for user 1
-- (2, 1, '2026-12-31', 4), -- Infinity membership for user 2
-- (3, 1, '2025-01-01', 3); -- Expired Platinum for user 3
