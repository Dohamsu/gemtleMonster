-- ============================================
-- 오프라인 보상 시스템을 위한 last_collected_at 필드 추가
-- ============================================

-- player_alchemy 테이블에 last_collected_at 컬럼 추가
ALTER TABLE player_alchemy
ADD COLUMN IF NOT EXISTS last_collected_at TIMESTAMPTZ DEFAULT NOW();

-- 설명: 마지막으로 자원을 수집한 시간
-- 사용: 재접속 시 경과 시간을 계산하여 오프라인 보상 지급

-- 기존 데이터에 대해 현재 시간으로 초기화
UPDATE player_alchemy
SET last_collected_at = NOW()
WHERE last_collected_at IS NULL;

-- 인덱스 추가 (빠른 조회를 위해)
CREATE INDEX IF NOT EXISTS idx_player_alchemy_last_collected
ON player_alchemy(last_collected_at);

-- 코멘트 추가
COMMENT ON COLUMN player_alchemy.last_collected_at IS '마지막 자원 수집 시간 (오프라인 보상 계산용)';
