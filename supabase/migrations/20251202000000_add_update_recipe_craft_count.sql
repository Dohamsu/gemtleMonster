-- Function to update recipe craft count
create or replace function public.update_recipe_craft_count(
  p_user_id uuid,
  p_recipe_id text,
  p_success boolean
)
returns void
language plpgsql
security definer
as $$
begin
  insert into public.player_recipe (user_id, recipe_id, is_discovered, first_discovered_at, craft_count, success_count)
  values (
    p_user_id,
    p_recipe_id,
    true,
    now(),
    1,
    case when p_success then 1 else 0 end
  )
  on conflict (user_id, recipe_id)
  do update set
    craft_count = player_recipe.craft_count + 1,
    success_count = player_recipe.success_count + (case when p_success then 1 else 0 end),
    is_discovered = true;
end;
$$;
