#!/bin/bash
# Script to apply race condition prevention migration
# Run this on your server where PostgreSQL is installed

echo "════════════════════════════════════════════════════════════════"
echo "Applying Race Condition Prevention Migration"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Database connection details - MODIFY THESE IF NEEDED
DB_NAME="padel_mindset"
DB_USER="postgres"
DB_HOST="localhost"

echo "Connecting to database: $DB_NAME"
echo ""

# Run the migration
psql -U $DB_USER -d $DB_NAME -h $DB_HOST << 'EOF'

-- Check for existing duplicates first
DO $$
DECLARE
  duplicate_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO duplicate_count
  FROM (
    SELECT id_plage_horaire, date, COUNT(*) as cnt
    FROM reservation
    WHERE "isCancel" = 0
    GROUP BY id_plage_horaire, date
    HAVING COUNT(*) > 1
  ) duplicates;
  
  IF duplicate_count > 0 THEN
    RAISE WARNING 'Found % duplicate reservations!', duplicate_count;
    RAISE NOTICE 'Listing duplicates:';
    FOR rec IN 
      SELECT id_plage_horaire, date, COUNT(*) as cnt, array_agg(id) as reservation_ids
      FROM reservation
      WHERE "isCancel" = 0
      GROUP BY id_plage_horaire, date
      HAVING COUNT(*) > 1
    LOOP
      RAISE NOTICE '  Slot: %, Date: %, Count: %, IDs: %', 
        rec.id_plage_horaire, rec.date, rec.cnt, rec.reservation_ids;
    END LOOP;
    RAISE NOTICE '';
    RAISE NOTICE 'Please manually resolve duplicates before applying constraint.';
    RAISE NOTICE 'You can cancel duplicate reservations using:';
    RAISE NOTICE '  UPDATE reservation SET "isCancel" = 1 WHERE id = <duplicate_id>;';
  ELSE
    RAISE NOTICE '✅ No duplicates found - safe to proceed';
  END IF;
END $$;

-- Drop old constraint if exists
DROP INDEX IF EXISTS uniq_private_plage_horaire;

-- Create the unique constraint
CREATE UNIQUE INDEX IF NOT EXISTS uniq_active_reservation_per_slot_date 
ON reservation (id_plage_horaire, date) 
WHERE "isCancel" = 0;

-- Add documentation
COMMENT ON INDEX uniq_active_reservation_per_slot_date IS 
'Prevents duplicate active reservations for the same time slot and date - primary race condition protection';

-- Verify creation
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'uniq_active_reservation_per_slot_date'
  ) THEN
    RAISE NOTICE '';
    RAISE NOTICE '════════════════════════════════════════════════════════════════';
    RAISE NOTICE '✅ SUCCESS: Migration completed successfully!';
    RAISE NOTICE '════════════════════════════════════════════════════════════════';
    RAISE NOTICE '';
    RAISE NOTICE 'The unique constraint is now active.';
    RAISE NOTICE 'When two users try to book the same slot simultaneously:';
    RAISE NOTICE '  - First user: SUCCESS';
    RAISE NOTICE '  - Second user: ERROR with French message';
    RAISE NOTICE '';
  ELSE
    RAISE WARNING '❌ FAILED: Constraint was not created';
  END IF;
END $$;

EOF

echo ""
echo "Migration script completed!"
echo ""
echo "Next steps:"
echo "1. Restart your backend server: pm2 restart padel-backend"
echo "2. Test with two devices clicking the same slot simultaneously"
echo ""
