-- ============================================
-- DB 재료 중복 확인 및 수정
-- ============================================

-- 1. 중복 재료 확인 (이름과 ID 기준)
SELECT 
    id, 
    name, 
    COUNT(*) as count 
FROM material 
GROUP BY id, name 
HAVING COUNT(*) > 1;

-- 2. 모든 재료 목록 확인 (beast_fang 필터)
SELECT id, name, family, rarity, created_at
FROM material
WHERE name LIKE '%송곳니%' OR id LIKE '%fang%'
ORDER BY created_at;

-- 3. 중복 ID 확인
SELECT 
    id, 
    COUNT(*) as cnt 
FROM material 
GROUP BY id 
HAVING COUNT(*) > 1;

-- ============================================
-- 만약 중복이 발견되면 아래 쿼리를 실행하세요
-- ============================================

-- 4. 중복 레코드 삭제 (가장 오래된 것 하나만 남기고 삭제)
-- 주의: 이 쿼리는 실제 데이터를 삭제하니 신중히 실행하세요!
/*
DELETE FROM material a
USING material b
WHERE a.ctid > b.ctid  -- ctid = PostgreSQL의 내부 행 ID
  AND a.id = b.id;
*/

-- 5. 또는 특정 ID의 중복만 삭제
-- DELETE FROM material WHERE id = 'beast_fang' AND ctid NOT IN (
--     SELECT MIN(ctid) FROM material WHERE id = 'beast_fang'
-- );

-- 6. 삭제 후 확인
-- SELECT id, name, family, rarity FROM material ORDER BY id;
