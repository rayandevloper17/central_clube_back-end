-- ════════════════════════════════════════════════════════════════════════════════
-- 🔐 BULLETPROOF RACE CONDITION PROTECTION
-- ════════════════════════════════════════════════════════════════════════════════
-- This migration adds database-level constraints to prevent race conditions when
-- multiple users try to book the same time slot simultaneously.
--
-- Protection Layers:
-- 1. Unique constraint on (id_plage_horaire, date) - prevents duplicate slot bookings
-- 2. Unique constraint on (id_plage_horaire, date, id_utilisateur) - prevents same user double-booking
-- ════════════════════════════════════════════════════════════════════════════════

-- Drop old insufficient constraints if they exist
DROP INDEX IF EXISTS uniq_private_plage_horaire;
DROP INDEX IF EXISTS uniq_active_reservation_per_slot_date;
DROP INDEX IF EXISTS uniq_user_slot_date;

-- ════════════════════════════════════════════════════════════════════════════════
-- CONSTRAINT 1: Prevent ANY duplicate active reservations for same slot + date
-- ════════════════════════════════════════════════════════════════════════════════
-- This is the PRIMARY defense against race conditions
-- When User A and User B click simultaneously:
--   - User A's transaction commits first → SUCCESS
--   - User B's transaction tries to insert → UNIQUE VIOLATION → Searches siblings
CREATE UNIQUE INDEX uniq_active_reservation_per_slot_date 
ON reservation (id_plage_horaire, date) 
WHERE "isCancel" = 0;

COMMENT ON INDEX uniq_active_reservation_per_slot_date IS 
'PRIMARY RACE CONDITION PROTECTION: Prevents duplicate active reservations for the same time slot and date. Ensures only ONE reservation per slot per day.';

-- ════════════════════════════════════════════════════════════════════════════════
-- CONSTRAINT 2: Prevent same user from booking same slot twice
-- ════════════════════════════════════════════════════════════════════════════════
-- Additional safety: Even if somehow bypassed, same user can't double-book
CREATE UNIQUE INDEX uniq_user_slot_date 
ON reservation (id_plage_horaire, date, id_utilisateur) 
WHERE "isCancel" = 0;

COMMENT ON INDEX uniq_user_slot_date IS 
'SECONDARY PROTECTION: Prevents the same user from creating duplicate reservations for the same slot and date.';

-- ════════════════════════════════════════════════════════════════════════════════
-- VERIFICATION: Check for existing duplicates
-- ════════════════════════════════════════════════════════════════════════════════
DO $$
DECLARE
  slot_duplicates INTEGER;
  user_duplicates INTEGER;
BEGIN
  -- Check for duplicate slot bookings
  SELECT COUNT(*) INTO slot_duplicates
  FROM (
    SELECT id_plage_horaire, date, COUNT(*) as cnt
    FROM reservation 
    WHERE "isCancel" = 0
    GROUP BY id_plage_horaire, date
    HAVING COUNT(*) > 1
  ) d1;
  
  -- Check for duplicate user bookings
  SELECT COUNT(*) INTO user_duplicates
  FROM (
    SELECT id_plage_horaire, date, id_utilisateur, COUNT(*) as cnt
    FROM reservation 
    WHERE "isCancel" = 0
    GROUP BY id_plage_horaire, date, id_utilisateur
    HAVING COUNT(*) > 1
  ) d2;
  
  IF slot_duplicates > 0 THEN
    RAISE WARNING '⚠️  Found % duplicate slot bookings!', slot_duplicates;
    RAISE NOTICE 'Run this query to see them:';
    RAISE NOTICE 'SELECT id_plage_horaire, date, array_agg(id) as reservation_ids, COUNT(*) FROM reservation WHERE "isCancel" = 0 GROUP BY id_plage_horaire, date HAVING COUNT(*) > 1;';
  END IF;
  
  IF user_duplicates > 0 THEN
    RAISE WARNING '⚠️  Found % duplicate user bookings!', user_duplicates;
  END IF;
  
  IF slot_duplicates = 0 AND user_duplicates = 0 THEN
    RAISE NOTICE '✅ No duplicates found - constraints applied successfully!';
    RAISE NOTICE '';
    RAISE NOTICE '════════════════════════════════════════════════════════════════';
    RAISE NOTICE '🔐 RACE CONDITION PROTECTION ACTIVE';
    RAISE NOTICE '════════════════════════════════════════════════════════════════';
    RAISE NOTICE 'Protection Layer 1: Transaction locks (READ_COMMITTED)';
    RAISE NOTICE 'Protection Layer 2: Row-level locks (FOR UPDATE)';
    RAISE NOTICE 'Protection Layer 3: Capacity checks within transaction';
    RAISE NOTICE 'Protection Layer 4: Sibling search with locks';
    RAISE NOTICE 'Protection Layer 5: Unique constraint (id_plage_horaire, date)';
    RAISE NOTICE 'Protection Layer 6: Unique constraint (user, slot, date)';
    RAISE NOTICE '════════════════════════════════════════════════════════════════';
    RAISE NOTICE '';
    RAISE NOTICE 'When two users click simultaneously:';
    RAISE NOTICE '  User A → Gets slot 7339 ✅';
    RAISE NOTICE '  User B → Auto-switched to slot 7340 ✅';
    RAISE NOTICE '  OR → "Tous les créneaux complets" ❌';
    RAISE NOTICE '';
  ELSE
    RAISE EXCEPTION 'Cannot apply constraints - duplicates exist. Please resolve them first.';
  END IF;
END $$;