-- Migration: Remove 'monster_' prefix from IDs
-- strategy: Drop constraints -> Update children -> Update parent (handle conflicts) -> Restore constraints

BEGIN;

-- 1. Drop Foreign Key Constraints Temporarily
-- We need to drop them because we are changing IDs that are referenced.
ALTER TABLE player_monster DROP CONSTRAINT IF EXISTS player_monster_monster_id_fkey;
ALTER TABLE monster_skill DROP CONSTRAINT IF EXISTS monster_skill_monster_id_fkey;

-- 2. Update Child Tables (player_monster, monster_skill)
-- We strip the prefix first. This temporarily creates "dangling pointers" if the parent ID hasn't been updated yet,
-- but since constraints are dropped, this is allowed.

-- Update player_monster
UPDATE player_monster 
SET monster_id = REGEXP_REPLACE(monster_id, '^monster_', '') 
WHERE monster_id LIKE 'monster_%';

-- Update monster_skill
UPDATE monster_skill 
SET monster_id = REGEXP_REPLACE(monster_id, '^monster_', '') 
WHERE monster_id LIKE 'monster_%';

-- 3. Update Other Tables (recipe)
-- recipe table does not have a strict FK but uses the ID.
UPDATE recipe 
SET result_monster_id = REGEXP_REPLACE(result_monster_id, '^monster_', '') 
WHERE result_monster_id LIKE 'monster_%';

-- 4. Update Parent Table (monster)
-- Logic:
-- Loop through all IDs with 'monster_' prefix.
-- Check if new ID (without prefix) already exists.
-- If exists -> Delete old ID (Child tables are already updated to point to new ID in Step 2).
-- If NOT exists -> Update old ID to new ID.
DO $$
DECLARE
    r RECORD;
    new_id TEXT;
BEGIN
    FOR r IN SELECT id FROM monster WHERE id LIKE 'monster_%' LOOP
        new_id := substring(r.id from 9); -- removes 'monster_' (length 8) + 1
        
        IF EXISTS (SELECT 1 FROM monster WHERE id = new_id) THEN
            -- Target ID already exists (e.g. 'slime_basic' exists along with 'monster_slime_basic').
            -- Since child tables now point to 'slime_basic' (from Step 2),
            -- 'monster_slime_basic' is now an orphan/duplicate that we can remove.
            DELETE FROM monster WHERE id = r.id;
        ELSE
            -- Target ID does not exist.
            -- Rename 'monster_slime_basic' to 'slime_basic'.
            UPDATE monster SET id = new_id WHERE id = r.id;
        END IF;
    END LOOP;
END $$;

-- 5. Restore Foreign Key Constraints
-- Now that both parent and children use clean IDs, we re-bind the constraints.
ALTER TABLE player_monster 
ADD CONSTRAINT player_monster_monster_id_fkey 
FOREIGN KEY (monster_id) REFERENCES monster(id) ON DELETE CASCADE;

ALTER TABLE monster_skill 
ADD CONSTRAINT monster_skill_monster_id_fkey 
FOREIGN KEY (monster_id) REFERENCES monster(id) ON DELETE CASCADE;

COMMIT;
