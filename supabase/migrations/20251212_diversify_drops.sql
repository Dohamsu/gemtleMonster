-- Add drops column to monster table if it doesn't exist
ALTER TABLE public.monster 
ADD COLUMN IF NOT EXISTS drops JSONB DEFAULT '[]'::jsonb;

-- Update the decompose_monsters function to use the strict drops definition
CREATE OR REPLACE FUNCTION public.decompose_monsters(
  monster_ids UUID[]
)
RETURNS TABLE (
  deleted_count INTEGER,
  rewards JSONB
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_monster_id UUID;
  v_monster_def_id TEXT;
  v_rarity TEXT;
  v_total_rewards JSONB := '{}'::jsonb;
  v_current_count INTEGER;
  v_data_drops JSONB;
  v_drop_item JSONB;
  v_roll INTEGER;
  v_amount INTEGER;
  v_deleted_count INTEGER := 0;
BEGIN
  -- Loop through each monster ID provided
  FOREACH v_monster_id IN ARRAY monster_ids
  LOOP
    -- Get monster definition ID and rarity
    SELECT m.id, d.rarity, d.drops
    INTO v_monster_def_id, v_rarity, v_data_drops
    FROM public.player_monster pm
    JOIN public.monster d ON pm.monster_id = d.id
    WHERE pm.id = v_monster_id AND pm.user_id = auth.uid();

    -- If monster exists and belongs to user
    IF FOUND THEN
      -- Delete the monster
      DELETE FROM public.player_monster WHERE id = v_monster_id;
      v_deleted_count := v_deleted_count + 1;

      -- 1. Default Essence Reward (Always given based on rarity)
      v_amount := CASE 
        WHEN v_rarity = 'SSR' THEN 30
        WHEN v_rarity = 'SR' THEN 10
        WHEN v_rarity = 'R' THEN 3
        ELSE 1
      END;
      
      v_current_count := COALESCE((v_total_rewards->>'essence')::INTEGER, 0);
      v_total_rewards := jsonb_set(v_total_rewards, '{essence}', to_jsonb(v_current_count + v_amount));

      -- 2. Process Specific Drops from JSONB
      IF v_data_drops IS NOT NULL AND jsonb_array_length(v_data_drops) > 0 THEN
        FOR v_drop_item IN SELECT * FROM jsonb_array_elements(v_data_drops)
        LOOP
            -- Roll for chance (0-100)
            v_roll := floor(random() * 100) + 1;
            IF v_roll <= (v_drop_item->>'chance')::INTEGER THEN
                -- Calculate amount
                v_amount := floor(random() * ((v_drop_item->>'max')::INTEGER - (v_drop_item->>'min')::INTEGER + 1) + (v_drop_item->>'min')::INTEGER)::INTEGER;
                
                IF v_amount > 0 THEN
                    v_current_count := COALESCE((v_total_rewards->>(v_drop_item->>'materialId')), '0')::INTEGER;
                    v_total_rewards := jsonb_set(v_total_rewards, ARRAY[v_drop_item->>'materialId'], to_jsonb(v_current_count + v_amount));
                END IF;
            END IF;
        END LOOP;
      
      ELSE
        -- FALLBACK: Old Logic based on Rarity (if no drops defined)
        -- Base material
        DECLARE
            v_base_mat TEXT;
        BEGIN
            v_base_mat := CASE 
                WHEN v_rarity = 'SSR' THEN 'gem_fragment'
                WHEN v_rarity = 'SR' THEN 'ore_magic'
                WHEN v_rarity = 'R' THEN 'ore_iron'
                ELSE 'slime_fluid' -- Default fallback
            END;
            v_amount := CASE 
                WHEN v_rarity = 'SSR' THEN 1
                WHEN v_rarity = 'SR' THEN 2
                WHEN v_rarity = 'R' THEN 2
                ELSE 1
            END;
            v_current_count := COALESCE((v_total_rewards->>v_base_mat)::INTEGER, 0);
            v_total_rewards := jsonb_set(v_total_rewards, ARRAY[v_base_mat], to_jsonb(v_current_count + v_amount));
        END;
      END IF;

    END IF;
  END LOOP;

  -- Batch add materials to player inventory using existing function
  IF v_deleted_count > 0 THEN
      PERFORM public.batch_add_materials(v_total_rewards);
  END IF;

  RETURN QUERY SELECT v_deleted_count, v_total_rewards;
END;
$$;
