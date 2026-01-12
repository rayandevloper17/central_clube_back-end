-- ════════════════════════════════════════════════════════════════════════════════
-- 🔥 FIX: Allow multiple PENDING open matches to compete
-- ════════════════════════════════════════════════════════════════════════════════
-- Problem: Current unique constraint blocks ALL active reservations, including
--          pending open matches. This prevents multiple users from creating
--          open matches for the same slot.
--
-- Solution: Modify constraint to only enforce uniqueness for:
--           - Private matches (typer=1)
--           - Valid open matches (typer=2, etat=1)
--           Allow: Multiple pending open matches (typer=2, etat!=1)
-- ════════════════════════════════════════════════════════════════════════════════

-- Drop the old constraint
DROP INDEX IF EXISTS uniq_active_reservation_per_slot_date;

-- Create the new constraint that allows pending open matches
CREATE UNIQUE INDEX uniq_active_reservation_per_slot_date 
ON reservation (id_plage_horaire, date) 
WHERE "isCancel" = 0 
  AND (typer = 1 OR (typer = 2 AND etat = 1));

-- Update the comment
COMMENT ON INDEX uniq_active_reservation_per_slot_date IS 
'Prevents duplicate reservations for same slot+date. Allows multiple PENDING open matches (typer=2, etat!=1) to compete. Only enforces uniqueness for private matches (typer=1) and valid open matches (typer=2, etat=1).';

-- Verify the new constraint
SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'reservation'
  AND indexname = 'uniq_active_reservation_per_slot_date';

-- Test query: Show all active reservations for same slot
-- This should now allow multiple pending open matches
SELECT 
  id,
  id_plage_horaire,
  date,
  typer,
  etat,
  "isCancel",
  date_creation,
  CASE 
    WHEN typer = 1 THEN 'Private'
    WHEN typer = 2 AND etat = 1 THEN 'Open (Valid)'
    WHEN typer = 2 AND etat != 1 THEN 'Open (Pending)'
    ELSE 'Other'
  END as match_type
FROM reservation
WHERE "isCancel" = 0
ORDER BY id_plage_horaire, date, date_creation;
