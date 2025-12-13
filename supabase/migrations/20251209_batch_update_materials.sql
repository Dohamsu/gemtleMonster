-- 배치를 통한 재료 일괄 추가 함수
-- Usage: supabase.rpc('batch_add_materials', { p_user_id: '...', p_materials: { "herb_common": 10, "ore_iron": -5 } })
-- 음수 값도 지원하되, 결과가 0 미만이 되지 않도록 GREATEST(0, ...) 사용

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

    -- UPSERT with negative protection
    -- 1. 새 행 삽입 시: GREATEST(0, qty)를 사용하여 음수 방지
    -- 2. 기존 행 업데이트 시: GREATEST(0, existing + qty)를 사용하여 음수 방지
    insert into player_material (user_id, material_id, quantity)
    values (p_user_id, m_id, GREATEST(0, qty::numeric))
    on conflict (user_id, material_id)
    do update set quantity = GREATEST(0, player_material.quantity + qty::numeric);
  end loop;
end;
$$ language plpgsql;
