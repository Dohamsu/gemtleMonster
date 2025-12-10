-- Add discovered_ingredients column to player_recipe table
ALTER TABLE player_recipe 
ADD COLUMN IF NOT EXISTS discovered_ingredients JSONB DEFAULT '[]'::jsonb;

-- Comment for the column
COMMENT ON COLUMN player_recipe.discovered_ingredients IS 'List of material IDs that the player has discovered for this recipe';

-- Function to update discovered ingredients
CREATE OR REPLACE FUNCTION discover_recipe_ingredient(
  p_user_id UUID,
  p_recipe_id TEXT,
  p_material_id TEXT
) RETURNS JSONB AS $$
DECLARE
  v_current_ingredients JSONB;
  v_new_ingredients JSONB;
BEGIN
  -- Get current ingredients
  SELECT discovered_ingredients INTO v_current_ingredients
  FROM player_recipe
  WHERE user_id = p_user_id AND recipe_id = p_recipe_id;

  -- Initialize if null (though default handles this for new rows)
  IF v_current_ingredients IS NULL THEN
    v_current_ingredients := '[]'::jsonb;
  END IF;

  -- Check if already exists
  IF v_current_ingredients @> to_jsonb(p_material_id) THEN
    RETURN v_current_ingredients;
  END IF;

  -- Append new ingredient
  v_new_ingredients := v_current_ingredients || to_jsonb(p_material_id);

  -- Update table (UPSERT to handle case where row doesn't exist yet, though usually recipe row exists if we track it)
  -- Note: If discovery happens before the recipe row exists, we create it.
  INSERT INTO player_recipe (user_id, recipe_id, discovered_ingredients, is_discovered)
  VALUES (p_user_id, p_recipe_id, v_new_ingredients, false)
  ON CONFLICT (user_id, recipe_id)
  DO UPDATE SET discovered_ingredients = v_new_ingredients;

  RETURN v_new_ingredients;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
