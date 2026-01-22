-- Insert Test Memberships for Different Users
-- Make sure to replace user IDs with actual user IDs from your database

-- Test User 1: Normal Member (Type 0) - No active membership
-- This user will have default Normal privileges

-- Test User 2: Access Member (Type 1)
INSERT INTO membership (id_user, id_club, dateend, typemmbership, created_at, updated_at)
VALUES (
  521, -- Replace with your test user ID
  1,   -- Club ID
  '2026-06-30 23:59:59', -- Expires June 30, 2026
  1,   -- Access membership
  NOW(),
  NOW()
)
ON CONFLICT (id_user, id_club) 
DO UPDATE SET 
  dateend = EXCLUDED.dateend,
  typemmbership = EXCLUDED.typemmbership,
  updated_at = NOW();

-- Test User 3: Gold Member (Type 2)
INSERT INTO membership (id_user, id_club, dateend, typemmbership, created_at, updated_at)
VALUES (
  522, -- Replace with another test user ID
  1,   -- Club ID
  '2026-12-31 23:59:59', -- Expires Dec 31, 2026
  2,   -- Gold membership
  NOW(),
  NOW()
);

-- Test User 4: Platinum Member (Type 3)
INSERT INTO membership (id_user, id_club, dateend, typemmbership, created_at, updated_at)
VALUES (
  523, -- Replace with another test user ID
  1,   -- Club ID
  '2027-03-15 23:59:59', -- Expires March 15, 2027
  3,   -- Platinum membership
  NOW(),
  NOW()
);

-- Test User 5: Infinity Member (Type 4)
INSERT INTO membership (id_user, id_club, dateend, typemmbership, created_at, updated_at)
VALUES (
  524, -- Replace with another test user ID
  1,   -- Club ID
  '2030-12-31 23:59:59', -- Expires far in future
  4,   -- Infinity membership
  NOW(),
  NOW()
);

-- Test User 6: Expired Membership (should revert to Normal)
INSERT INTO membership (id_user, id_club, dateend, typemmbership, created_at, updated_at)
VALUES (
  525, -- Replace with another test user ID
  1,   -- Club ID
  '2025-01-01 23:59:59', -- Already expired
  3,   -- Was Platinum but expired
  NOW(),
  NOW()
);

-- Verify the insertions
SELECT 
  id,
  id_user,
  id_club,
  dateend,
  typemmbership,
  CASE 
    WHEN dateend < NOW() THEN 'EXPIRED'
    WHEN typemmbership = 0 THEN 'Normal'
    WHEN typemmbership = 1 THEN 'Access'
    WHEN typemmbership = 2 THEN 'Gold'
    WHEN typemmbership = 3 THEN 'Platinum'
    WHEN typemmbership = 4 THEN 'Infinity'
  END as membership_type
FROM membership
ORDER BY id_user;
