-- Quick Migration Script for Race Condition Prevention
-- Run this file to apply the unique constraint to prevent duplicate reservations

\echo '════════════════════════════════════════════════════════════════════════'
\echo 'Race Condition Prevention Migration'
\echo 'Adding unique constraint to participant table'
\echo '════════════════════════════════════════════════════════════════════════'
\echo ''

-- Step 1: Check for existing duplicates
\echo 'Step 1: Checking for existing duplicate team slots...'
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
    RAISE WARNING 'Found % duplicate team slot assignments!', duplicate_count;
    RAISE NOTICE 'Please review and fix duplicates before applying constraint:';
    FOR rec IN 
      SELECT id_reservation, team, COUNT(*) as cnt
      FROM participant
      WHERE team IS NOT NULL
      GROUP BY id_reservation, team
      HAVING COUNT(*) > 1
    LOOP
      RAISE NOTICE '  Reservation ID: %, Team: %, Count: %', rec.id_reservation, rec.team, rec.cnt;
    END LOOP;
    RAISE EXCEPTION 'Cannot proceed with duplicates present';
  ELSE
    RAISE NOTICE '✅ No duplicates found - safe to proceed';
  END IF;
END $$;

\echo ''
\echo 'Step 2: Creating unique constraint...'

-- Step 2: Add the unique constraint
CREATE UNIQUE INDEX IF NOT EXISTS uniq_participant_reservation_team 
ON participant (id_reservation, team)
WHERE team IS NOT NULL;

-- Step 3: Add documentation
COMMENT ON INDEX uniq_participant_reservation_team IS 
'Prevents duplicate team slot assignments per reservation - critical race condition protection';

\echo ''
\echo 'Step 3: Verifying constraint creation...'

-- Step 4: Verify
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

\echo ''
\echo '════════════════════════════════════════════════════════════════════════'
\echo 'Migration Complete!'
\echo '════════════════════════════════════════════════════════════════════════'
\echo ''
\echo 'Next steps:'
\echo '1. Restart your backend server'
\echo '2. Test the race condition protection'
\echo '3. Deploy to production'
\echo ''
