-- 배치를 통한 재료 일괄 추가 함수
-- Usage: supabase.rpc('add_materials_batch', { p_user_id: '...', p_materials: { "herb_common": 10, "ore_iron": 5 } })

create or replace function batch_add_materials(
  p_user_id uuid,
  p_materials jsonb
) returns void as $$
declare
  m_id text;
  qty numeric;
begin
  -- JSONB의 각 키(재료ID)와 값(수량)을 순회하며 업데이트
  for m_id, qty in select * from jsonb_each_text(p_materials)
  loop
    -- 수량이 0이면 건너뜀
    if qty::numeric = 0 then
      continue;
    end if;

    insert into player_material (user_id, material_id, quantity)
    values (p_user_id, m_id, qty::numeric)
    on conflict (user_id, material_id)
    do update set quantity = player_material.quantity + excluded.quantity;
  end loop;
end;
$$ language plpgsql;
