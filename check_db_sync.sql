-- ============================================
-- DB 동기화 상태 점검 SQL
-- ============================================

-- 1. 광산 재료들이 material 테이블에 존재하는지 확인
SELECT 
    id, 
    name, 
    family, 
    rarity, 
    sell_price,
    CASE 
        WHEN id IN ('ore_iron', 'ore_magic', 'gem_fragment', 'herb_common', 'herb_rare', 'herb_special') 
        THEN '✅ 광산 재료'
        ELSE '기타'
    END as material_type
FROM material
WHERE id IN ('ore_iron', 'ore_magic', 'gem_fragment', 'herb_common', 'herb_rare', 'herb_special')
ORDER BY id;

-- 2. material 테이블의 모든 재료 목록 (참고용)
SELECT id, name, family, rarity, sell_price
FROM material
ORDER BY family, rarity;

-- 3. add_materials RPC 함수 존재 여부 확인
SELECT 
    routine_name,
    routine_type,
    routine_definition
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'add_materials';

-- 4. consume_materials RPC 함수 존재 여부 확인
SELECT 
    routine_name,
    routine_type,
    routine_definition
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'consume_materials';

-- 5. player_material 테이블에 현재 유저의 재료 확인 (user_id는 실제 값으로 변경)
-- SELECT material_id, quantity
-- FROM player_material
-- WHERE user_id = 'YOUR_USER_ID_HERE'
-- ORDER BY material_id;

-- 6. 광산 재료가 없다면 추가하는 INSERT 문 (필요시 실행)
-- INSERT INTO material (id, name, family, rarity, sell_price, is_special, description)
-- VALUES
--     ('ore_iron', '철광석', 'MINERAL', 'COMMON', 50, false, '일반적인 철 광석'),
--     ('ore_magic', '마력석', 'MINERAL', 'RARE', 100, false, '마력이 깃든 광석'),
--     ('gem_fragment', '보석 파편', 'MINERAL', 'RARE', 500, false, '반짝이는 보석 조각'),
--     ('herb_common', '일반 약초', 'PLANT', 'COMMON', 30, false, '흔한 약초'),
--     ('herb_rare', '희귀 약초', 'PLANT', 'UNCOMMON', 80, false, '귀한 약초'),
--     ('herb_special', '특수 약초', 'PLANT', 'RARE', 150, false, '특별한 효능을 가진 약초')
-- ON CONFLICT (id) DO UPDATE
-- SET 
--     name = EXCLUDED.name,
--     family = EXCLUDED.family,
--     rarity = EXCLUDED.rarity,
--     sell_price = EXCLUDED.sell_price,
--     description = EXCLUDED.description;
