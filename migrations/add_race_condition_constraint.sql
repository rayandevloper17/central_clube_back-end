-- Migration to add unique constraint preventing duplicate active reservations
-- This is the PRIMARY defense against race conditions at the database level

-- Drop the old insufficient constraint if it exists
DROP INDEX IF EXISTS uniq_private_plage_horaire;

-- Create a proper unique constraint for active reservations
-- This prevents ANY duplicate active reservations for the same time slot and date
CREATE UNIQUE INDEX uniq_active_reservation_per_slot_date 
ON reservation (id_plage_horaire, date) 
WHERE "isCancel" = 0;

-- Add comment for documentation
COMMENT ON INDEX uniq_active_reservation_per_slot_date IS 
'Prevents duplicate active reservations for the same time slot and date - primary race condition protection';

-- Verify the constraint works by testing with existing data
-- This query should return 0 if no duplicates exist
SELECT COUNT(*) as duplicate_count
FROM (
  SELECT id_plage_horaire, date, COUNT(*) as cnt
  FROM reservation 
  WHERE "isCancel" = 0
  GROUP BY id_plage_horaire, date
  HAVING COUNT(*) > 1
) duplicates;