-- Migration: Add unique constraint to prevent race conditions in participant team slots
-- This ensures only ONE participant can occupy each team position (0-3) per reservation
-- Prevents the race condition where two users click the same slot simultaneously

-- Step 1: Check for existing duplicates (should be run first to identify issues)
DO $$
DECLARE
  duplicate_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO duplicate_count
  FROM (
    SELECT id_reservation, team, COUNT(*) as cnt
    FROM participant
    WHERE team IS NOT NULL
    GROUP BY id_reservation, team
    HAVING COUNT(*) > 1
  ) duplicates;
  
  IF duplicate_count > 0 THEN
    RAISE NOTICE 'WARNING: Found % duplicate team slot assignments. These must be resolved before applying the constraint.', duplicate_count;
    -- List the duplicates for manual review
    RAISE NOTICE 'Duplicate entries:';
    FOR rec IN 
      SELECT id_reservation, team, COUNT(*) as cnt
      FROM participant
      WHERE team IS NOT NULL
      GROUP BY id_reservation, team
      HAVING COUNT(*) > 1
    LOOP
      RAISE NOTICE 'Reservation ID: %, Team: %, Count: %', rec.id_reservation, rec.team, rec.cnt;
    END LOOP;
  ELSE
    RAISE NOTICE 'No duplicate team slots found. Safe to proceed with constraint.';
  END IF;
END $$;

-- Step 2: Add the unique constraint
-- This will FAIL if duplicates exist (which is good - forces manual cleanup)
CREATE UNIQUE INDEX IF NOT EXISTS uniq_participant_reservation_team 
ON participant (id_reservation, team)
WHERE team IS NOT NULL;

-- Step 3: Add documentation comment
COMMENT ON INDEX uniq_participant_reservation_team IS 
'Prevents duplicate team slot assignments per reservation - critical race condition protection. Ensures only one participant can occupy each team position (0-3) in a match.';

-- Step 4: Verify the constraint was created successfully
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'uniq_participant_reservation_team'
  ) THEN
    RAISE NOTICE '✅ SUCCESS: Unique constraint created successfully';
  ELSE
    RAISE WARNING '❌ FAILED: Constraint was not created';
  END IF;
END $$;
