-- ═══════════════════════════════════════════════════════════════════════════════
-- Fix Membership Table - Add Missing Columns
-- ═══════════════════════════════════════════════════════════════════════════════

-- Add missing timestamp columns if they don't exist
DO $$ 
BEGIN
    -- Add created_at column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'membership' AND column_name = 'created_at'
    ) THEN
        ALTER TABLE membership ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
        RAISE NOTICE 'Added created_at column';
    ELSE
        RAISE NOTICE 'created_at column already exists';
    END IF;

    -- Add updated_at column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'membership' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE membership ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
        RAISE NOTICE 'Added updated_at column';
    ELSE
        RAISE NOTICE 'updated_at column already exists';
    END IF;
END $$;

-- Add unique constraint if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'membership_user_club_unique'
    ) THEN
        ALTER TABLE membership ADD CONSTRAINT membership_user_club_unique UNIQUE (id_user, id_club);
        RAISE NOTICE 'Added unique constraint';
    ELSE
        RAISE NOTICE 'Unique constraint already exists';
    END IF;
END $$;

-- Verify the table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns
WHERE table_name = 'membership'
ORDER BY ordinal_position;
