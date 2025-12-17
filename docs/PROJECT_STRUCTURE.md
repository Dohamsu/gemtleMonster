# 프로젝트 구조 문서

> **gemtleMonster** - React + Supabase 기반 방치형 RPG 게임
> **마지막 업데이트**: 2025-12-17
> **분석 도구**: Claude Code SuperClaude

---

## 📋 목차

1. [프로젝트 개요](#프로젝트-개요)
2. [디렉토리 구조](#디렉토리-구조)
3. [기술 스택](#기술-스택)
4. [핵심 게임 시스템](#핵심-게임-시스템)
5. [상태 관리](#상태-관리)
6. [데이터베이스 구조](#데이터베이스-구조)
7. [개발 워크플로우](#개발-워크플로우)
8. [AI 워크플로우 시스템](#ai-워크플로우-시스템)

---

## 프로젝트 개요

### 기본 정보

- **프로젝트명**: gemtleMonster (젬틀몬스터)
- **장르**: 방치형 RPG 게임
- **플랫폼**: 웹 (PWA 지원)
- **프레임워크**: React 19.2.1 + TypeScript
- **백엔드**: Supabase (PostgreSQL)
- **배포**: Vercel

### 코드 통계

| 구분 | 수치 |
|------|------|
| 총 TypeScript 파일 | 111개 |
| 총 코드 라인 수 | 24,360 라인 |
| 주요 모듈 수 | 9개 |
| 데이터베이스 테이블 | 20+ 개 |

---

## 디렉토리 구조

### 최상위 구조

```
gemtleMonster/
├── .agent/              # AI 워크플로우 가이드 (독특한 특징)
│   ├── rules/          # 콘텐츠 추가 규칙
│   └── workflows/      # 자동화 워크플로우
├── .claude/            # Claude AI 설정
├── .vercel/            # Vercel 배포 설정
├── docs/               # 프로젝트 문서
├── public/             # 정적 에셋
│   └── assets/         # 게임 이미지, 아이콘
├── src/                # 소스 코드 (메인)
├── supabase/           # DB 스키마 및 마이그레이션
└── dist/               # 빌드 결과물
```

### src/ 상세 구조 (크기순)

```
src/
├── ui/           555KB  # 최대 규모 - UI 컴포넌트
│   ├── alchemy/        # 연금술 시스템 UI
│   ├── dungeon/        # 던전 및 전투 UI
│   ├── monster/        # 몬스터 관리 UI
│   ├── shop/           # 상점 UI
│   ├── idle/           # 시설 관리 UI
│   └── common/         # 공통 컴포넌트
│
├── data/         232KB  # 게임 데이터, 시드 스크립트
│   ├── alchemyData.ts        # 재료, 레시피 데이터
│   ├── monsterData.ts        # 몬스터 데이터
│   ├── monsterSkillData.ts   # 스킬 데이터
│   ├── dungeonData.ts        # 던전 데이터
│   ├── facilityData.ts       # 시설 데이터
│   └── seed*.ts              # DB 시드 스크립트
│
├── hooks/        104KB  # React 커스텀 훅
│   ├── useFacilities.ts      # 시설 관리
│   ├── useAutoCollection.ts  # 자동 수집
│   ├── useOfflineRewards.ts  # 오프라인 보상
│   └── useAuth.ts            # 인증
│
├── store/         92KB  # Zustand 상태 관리
│   ├── useGameStore.ts       # 전역 게임 상태
│   ├── useAlchemyStore.ts    # 연금술 상태
│   └── useShopStore.ts       # 상점 상태
│
├── lib/           77KB  # 비즈니스 로직, API
│   ├── supabaseClient.ts     # Supabase 클라이언트
│   ├── alchemyApi.ts         # 연금술 API
│   ├── alchemyLogic.ts       # 연금술 로직
│   ├── monsterApi.ts         # 몬스터 API
│   └── battleUtils.ts        # 전투 유틸리티
│
├── game/          76KB  # Canvas 렌더링, 게임 루프
│   ├── GameCanvas.tsx        # Canvas 래퍼
│   ├── GameLoop.ts           # 게임 루프 (60fps)
│   └── renderers/            # 각 화면별 렌더러
│       ├── mapRenderer.ts
│       ├── alchemyRenderer.ts
│       └── shopRenderer.ts
│
├── types/         64KB  # TypeScript 타입 정의
│   ├── supabase.ts           # Supabase 자동 생성 타입
│   ├── game.ts               # 게임 타입
│   └── alchemy.ts            # 연금술 타입
│
├── assets/        56KB  # Lottie 애니메이션
├── utils/         40KB  # 유틸리티 함수
└── constants/      4KB  # 게임 상수
```

---

## 기술 스택

### Frontend

| 기술 | 버전 | 용도 |
|------|------|------|
| React | 19.2.1 | UI 프레임워크 |
| TypeScript | 5.9.3 | 타입 안전성 |
| Vite | 7.2.4 | 빌드 도구 |
| Zustand | 5.0.8 | 상태 관리 |
| Lottie-react | 2.4.1 | 애니메이션 |

### Backend & Database

| 기술 | 버전 | 용도 |
|------|------|------|
| Supabase | 2.84.0 | BaaS (Backend as a Service) |
| PostgreSQL | - | 데이터베이스 (Supabase 내장) |
| Row Level Security | - | 데이터 보안 |

### 개발 도구

| 도구 | 버전 | 용도 |
|------|------|------|
| ESLint | 8.57 | 코드 린팅 |
| Prettier | 3.2.5 | 코드 포맷팅 |
| tsx | 4.20.6 | 시드 스크립트 실행 |

### 배포 및 호스팅

- **호스팅**: Vercel
- **요구사항**: Node.js 20.19.0+
- **빌드 명령어**: `vite build`

---

## 핵심 게임 시스템

### 1. 연금술 시스템 (Alchemy)

**위치**: `src/ui/alchemy/`, `src/lib/alchemyApi.ts`, `src/lib/alchemyLogic.ts`

#### 주요 컴포넌트

| 파일 | 역할 |
|------|------|
| `AlchemyWorkshopOverlay.tsx` | 연금술 공방 메인 UI |
| `RecipeList.tsx` | 레시피 목록 표시 |
| `MaterialGrid.tsx` | 재료 선택 그리드 |
| `FreeFormCauldron.tsx` | 자유 조합 가마솥 |
| `AlchemyResultModal.tsx` | 제작 결과 모달 |
| `CodexPanel.tsx` | 도감 패널 |

#### 핵심 기능

- ✅ **레시피 기반 제작**: 정확한 재료 조합으로 몬스터 제작
- ✅ **실험 모드**: 자유 조합으로 새로운 몬스터 발견
- ✅ **성공률 시스템**: 레시피별 성공 확률
- ✅ **힌트 시스템**: 실패 시 레시피 힌트 제공
- ✅ **도감 기록**: 발견한 몬스터 및 레시피 기록

#### 데이터 흐름

```
1. 플레이어가 재료 선택 (MaterialGrid)
2. 레시피 매칭 (alchemyLogic.ts)
3. 성공률 계산 및 제작 시도
4. 결과 생성 (성공/실패/힌트)
5. DB 동기화 (player_monster, alchemy_history)
```

---

### 2. 던전 시스템 (Dungeon)

**위치**: `src/ui/dungeon/`, `src/lib/battleUtils.ts`, `src/data/dungeonData.ts`

#### 주요 컴포넌트

| 파일 | 역할 |
|------|------|
| `DungeonModal.tsx` | 던전 선택 UI |
| `BattleView.tsx` | 전투 화면 |
| `ConsumableConfigPanel.tsx` | 소모품 설정 |
| `battleUtils.ts` | 전투 로직 |

#### 던전 목록

| 던전 | 레벨 범위 | 주요 드랍 |
|------|-----------|-----------|
| 슬라임 동굴 | 1-5 | 초급 재료 |
| 숲의 심장부 | 5-10 | 중급 재료 |
| 수정 광산 | 10-15 | 광물 |
| 불꽃 화산 | 15-20 | 희귀 재료 |
| 크리스마스 | 이벤트 | 특수 재료 |

#### 전투 시스템

- ✅ **실시간 자동 전투**: 턴 기반 자동 전투
- ✅ **스킬 시스템**: 몬스터별 고유 스킬
- ✅ **상태 효과**: 버프/디버프 시스템
- ✅ **소모품 사용**: 전투 중 자동 포션 사용
- ✅ **보상 시스템**: 재료 드랍 및 경험치

---

### 3. 몬스터 관리 시스템

**위치**: `src/ui/monster/`, `src/lib/monsterApi.ts`, `src/data/monsterData.ts`

#### 주요 컴포넌트

| 파일 | 역할 |
|------|------|
| `MonsterFarm.tsx` | 몬스터 농장 (인벤토리) |
| `MonsterDetailModal.tsx` | 몬스터 상세 정보 |
| `SkillDetailModal.tsx` | 스킬 상세 정보 |
| `AwakeningModal.tsx` | 각성 시스템 |

#### 핵심 기능

- ✅ **몬스터 인벤토리**: 보유 몬스터 관리
- ✅ **잠금/해제**: 실수 방지 잠금 기능
- ✅ **몬스터 분해**: 재료로 변환
- ✅ **레벨링**: 전투를 통한 경험치 획득
- ✅ **각성 시스템**: 능력치 강화

---

### 4. 상점 시스템 (Shop)

**위치**: `src/ui/shop/`, `src/store/useShopStore.ts`

#### 주요 컴포넌트

| 파일 | 역할 |
|------|------|
| `Shop.tsx` | 상점 메인 |
| `ShopBuyTab.tsx` | 구매 탭 |
| `ShopSellTab.tsx` | 판매 탭 |
| `ShopTimer.tsx` | 새로고침 타이머 |

#### 경제 시스템

- ✅ **재료 구매/판매**: 골드 기반 거래
- ✅ **희귀도별 가격**: 재료 희귀도에 따른 가격 차등
- ✅ **상점 새로고침**: 일정 시간마다 상점 갱신
- ✅ **골드 관리**: 재화 획득 및 소비

---

### 5. 시설 관리 시스템 (Idle Facilities)

**위치**: `src/ui/idle/`, `src/hooks/useFacilities.ts`

#### 시설 목록

| 시설 | 기능 | 레벨 |
|------|------|------|
| 약초 농장 | 재료 자동 생산 | 1-3 |
| 광산 | 광물 자동 채굴 | 1-3 |
| 대장간 | 시설 업그레이드 | 1-5 |
| 정령 성소 | 특수 재료 생산 | 1 |

#### 핵심 기능

- ✅ **자동 수집**: 일정 시간마다 자동 재료 생산
- ✅ **시설 업그레이드**: 생산량 및 효율 증가
- ✅ **오프라인 보상**: 접속하지 않은 시간 동안의 보상 지급

---

## 상태 관리

### Zustand Store 구조

#### 1. `useGameStore` - 전역 게임 상태

**위치**: `src/store/useGameStore.ts`

**주요 상태**:

```typescript
{
  // 화면 상태
  canvasView: 'map' | 'dungeon' | 'alchemy_workshop' | 'shop' | 'awakening' | 'monster_farm'

  // 자원
  resources: Record<string, number>  // 골드, 재료 등

  // 시설
  facilities: Record<string, number>  // 시설 레벨

  // 전투
  battleState: BattleState | null  // 현재 전투 상태

  // UI
  selectedMonsters: string[]  // 선택된 몬스터 ID
}
```

#### 2. `useAlchemyStore` - 연금술 상태

**위치**: `src/store/useAlchemyStore.ts`

**주요 상태**:

```typescript
{
  // 플레이어 데이터
  playerMaterials: Record<string, number>  // 보유 재료
  playerRecipes: Record<string, PlayerRecipe>  // 발견한 레시피
  playerMonsters: PlayerMonster[]  // 보유 몬스터

  // 제작 상태
  selectedIngredients: Record<string, number>  // 선택한 재료
  isBrewing: boolean  // 제작 중 여부
  brewResult: {
    type: 'success' | 'failure' | 'hint'
    monsterId?: string
    hint?: string
    expGain?: number
  }
}
```

#### 3. `useShopStore` - 상점 상태

**위치**: `src/store/useShopStore.ts`

**주요 상태**:

```typescript
{
  // 상점 아이템
  shopItems: ShopItem[]  // 현재 판매 중인 아이템

  // 새로고침
  nextRefreshTime: number  // 다음 새로고침 시각

  // UI
  selectedTab: 'buy' | 'sell'  // 현재 탭
}
```

---

## 데이터베이스 구조

### 스키마 파일

| 파일 | 설명 |
|------|------|
| `supabase/alchemy_schema.sql` | 메인 게임 스키마 |
| `supabase/awakening_schema.sql` | 각성 시스템 스키마 |
| `supabase/migrations/` | DB 마이그레이션 파일 |

### 주요 테이블 구조

#### 마스터 데이터 테이블

```sql
-- 재료 마스터
material (
  id TEXT PRIMARY KEY,
  name TEXT,
  rarity TEXT,  -- common, uncommon, rare, epic, legendary
  icon TEXT,
  description TEXT
)

-- 몬스터 마스터
monster (
  id TEXT PRIMARY KEY,
  name TEXT,
  type TEXT,  -- slime, beast, elemental, etc.
  base_hp INTEGER,
  base_attack INTEGER,
  base_defense INTEGER,
  evolution_level INTEGER
)

-- 스킬 마스터
monster_skill (
  id TEXT PRIMARY KEY,
  monster_id TEXT REFERENCES monster(id),
  name TEXT,
  description TEXT,
  damage_multiplier NUMERIC,
  cooldown INTEGER
)

-- 레시피 마스터
alchemy_recipe (
  id TEXT PRIMARY KEY,
  monster_id TEXT REFERENCES monster(id),
  ingredients JSONB,  -- { "재료ID": 수량, ... }
  success_rate NUMERIC
)

-- 시설 마스터
facility (
  id TEXT PRIMARY KEY,
  name TEXT,
  max_level INTEGER
)

facility_level (
  facility_id TEXT REFERENCES facility(id),
  level INTEGER,
  upgrade_cost JSONB,
  production_rate NUMERIC,
  capacity INTEGER
)
```

#### 플레이어 데이터 테이블

```sql
-- 플레이어 보유 재료
player_material (
  user_id UUID REFERENCES auth.users(id),
  material_id TEXT REFERENCES material(id),
  quantity INTEGER,
  PRIMARY KEY (user_id, material_id)
)

-- 플레이어 발견 레시피
player_recipe (
  user_id UUID REFERENCES auth.users(id),
  recipe_id TEXT REFERENCES alchemy_recipe(id),
  discovered_at TIMESTAMP,
  PRIMARY KEY (user_id, recipe_id)
)

-- 플레이어 보유 몬스터
player_monster (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  monster_id TEXT REFERENCES monster(id),
  level INTEGER,
  exp INTEGER,
  is_locked BOOLEAN,
  awakening_level INTEGER
)

-- 연금술 제작 기록
alchemy_history (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  recipe_id TEXT,
  ingredients_used JSONB,
  result_type TEXT,  -- success, failure, hint
  result_monster_id TEXT,
  created_at TIMESTAMP
)

-- 플레이어 시설 정보
player_facility (
  user_id UUID REFERENCES auth.users(id),
  facility_id TEXT REFERENCES facility(id),
  level INTEGER,
  last_collected_at TIMESTAMP,
  PRIMARY KEY (user_id, facility_id)
)
```

### Row Level Security (RLS) 정책

모든 플레이어 데이터 테이블에는 RLS가 적용되어 있습니다:

```sql
-- 예시: player_material 테이블
CREATE POLICY "Users can only access their own materials"
ON player_material
FOR ALL
USING (auth.uid() = user_id);
```

---

## 개발 워크플로우

### NPM 스크립트

| 명령어 | 설명 |
|--------|------|
| `npm run dev` | 개발 서버 실행 (Vite) |
| `npm run build` | 프로덕션 빌드 (TypeScript + Vite) |
| `npm run preview` | 빌드 결과물 미리보기 |
| `npm run lint` | ESLint 검사 |
| `npm run format` | Prettier 포맷팅 |
| `npm run types:generate` | Supabase 타입 자동 생성 |

### 시드 스크립트

| 명령어 | 설명 |
|--------|------|
| `npm run seed:all` | 전체 데이터 시드 |
| `npm run seed:materials` | 재료 데이터만 시드 |
| `npm run seed:monsters` | 몬스터 데이터만 시드 |
| `npm run seed:skills` | 스킬 데이터만 시드 |
| `npm run seed:alchemy` | 레시피 데이터만 시드 |
| `npm run seed:facilities` | 시설 데이터만 시드 |

### 시드 데이터 흐름

```
1. TypeScript 파일에 데이터 정의 (src/data/)
   ├── alchemyData.ts (재료, 레시피)
   ├── monsterData.ts (몬스터)
   ├── monsterSkillData.ts (스킬)
   └── facilityData.ts (시설)

2. 시드 스크립트 실행 (src/data/seed*.ts)
   └── Supabase API를 통해 DB에 삽입

3. DB 동기화 완료
   └── 게임에서 마스터 데이터 사용 가능
```

---

## AI 워크플로우 시스템

### .agent 디렉토리 구조

```
.agent/
├── rules/
│   ├── content-guide.md     # 콘텐츠 추가 체크리스트
│   └── data-flow.md         # 데이터 플로우 다이어그램
└── workflows/
    ├── material.md          # 재료 추가 워크플로우
    ├── monster.md           # 몬스터 추가 워크플로우
    ├── recipe.md            # 레시피 추가 워크플로우
    └── facility.md          # 시설 추가 워크플로우
```

### 워크플로우 예시: 재료 추가

**파일**: `.agent/workflows/material.md`

```markdown
1. src/data/alchemyData.ts에 MATERIALS 추가
2. src/ui/common/ResourceIcon.tsx에 아이콘 매핑 (⚠️ 누락 시 ❓ 표시)
3. public/assets/materials/에 이미지 확인
4. npm run seed:alchemy 실행
```

### 워크플로우 예시: 몬스터 추가

**파일**: `.agent/workflows/monster.md`

```markdown
1. src/data/monsterData.ts에 MONSTER_DATA 추가
   ⚠️ 주의: ID에 'monster_' prefix 금지
2. (선택) src/data/monsterSkillData.ts에 스킬 추가
3. public/assets/monsters/에 이미지 확인
4. npm run seed:monsters 실행
```

### AI 워크플로우의 장점

1. **자동화**: AI 에이전트가 워크플로우를 참조하여 자동으로 콘텐츠 추가
2. **일관성**: 모든 콘텐츠 추가 시 동일한 절차 적용
3. **오류 방지**: 체크리스트를 통한 누락 방지
4. **문서화**: 프로세스가 명확히 문서화되어 있음

---

## 게임 에셋 구조

### public/assets/ 디렉토리

```
assets/
├── dungeons/          # 던전 배경 이미지
│   ├── beast_forest.png
│   ├── christmas.png
│   ├── crystal_cave.png
│   ├── fairy_forest.png
│   ├── lake.png
│   ├── magma_dungeon.png
│   ├── sky_catsle.png
│   └── slime_forest.png
│
├── facility/          # 시설 레벨별 이미지
│   ├── blacksmith_1.png ~ blacksmith_5.png
│   ├── forge_1.png ~ forge_4.png
│   ├── herb_farm_1.png ~ herb_farm_3.png
│   ├── mine_1.png ~ mine_3.png
│   └── spirit_santuary.png
│
├── materials/         # 재료 아이콘
├── monsters/          # 몬스터 이미지
├── skills/            # 스킬 아이콘
├── ui/                # UI 요소
└── lottie/            # Lottie 애니메이션
```

### 에셋 명명 규칙

- **시설 이미지**: `{시설ID}_{레벨}.png`
- **몬스터 이미지**: `{몬스터ID}.png` (⚠️ 'monster_' prefix 제외)
- **재료 아이콘**: `{재료ID}.png`
- **스킬 아이콘**: `{스킬ID}.png`

---

## 주요 디자인 패턴

### 컴포넌트 구조 패턴

```
UI 컴포넌트 분류:
├── src/ui/common/       # 공통 컴포넌트 (Button, Modal 등)
├── src/ui/alchemy/      # 연금술 특화 컴포넌트
├── src/ui/dungeon/      # 던전 특화 컴포넌트
├── src/ui/monster/      # 몬스터 특화 컴포넌트
├── src/ui/shop/         # 상점 특화 컴포넌트
└── src/ui/idle/         # 시설 특화 컴포넌트
```

### 데이터 레이어 패턴

```
1. 마스터 데이터 (정적)
   └── src/data/*.ts (TypeScript 정의)

2. 데이터베이스 동기화
   └── src/data/seed*.ts (시드 스크립트)

3. 플레이어 데이터 (동적)
   └── Supabase (실시간 동기화)

4. 상태 관리
   └── Zustand Store (로컬 캐시 + DB 동기화)
```

### 렌더링 패턴

```
App.tsx (루트)
  ├── useAuth() - 인증 관리
  ├── useGameStore() - 전역 상태
  ├── useAlchemyStore() - 연금술 상태
  ├── useAutoCollection() - 자동 수집
  ├── useOfflineRewards() - 오프라인 보상
  │
  ├── GameCanvas (Canvas 레이어)
  │   ├── mapRenderer - 맵 렌더링
  │   ├── alchemyRenderer - 연금술 공방 렌더링
  │   └── shopRenderer - 상점 렌더링
  │
  └── UIOverlay (UI 레이어)
      ├── AlchemyWorkshopOverlay
      ├── DungeonModal
      ├── MonsterFarm
      ├── Shop
      └── IdleFacilityList
```

---

## 프로젝트 특징 요약

### 강점

1. ✅ **체계적인 구조**: 기능별 명확한 모듈 분리
2. ✅ **AI 워크플로우 통합**: .agent 디렉토리로 자동화된 콘텐츠 추가
3. ✅ **타입 안전성**: TypeScript strict mode + 자동 타입 생성
4. ✅ **데이터 중심 설계**: 시드 스크립트로 마스터 데이터 관리
5. ✅ **Canvas 기반 게임**: 고성능 렌더링
6. ✅ **PWA 지원**: 오프라인 플레이 가능
7. ✅ **보안**: Supabase RLS로 데이터 보호

### 기술적 하이라이트

- **Zustand**: 경량 상태 관리 라이브러리
- **Supabase**: BaaS로 빠른 백엔드 구축
- **배치 동기화**: DB 부하 최소화
- **Lottie**: 고품질 애니메이션
- **반응형**: 모바일 최적화

### 게임 시스템 복잡도

| 시스템 | 복잡도 | 핵심 기술 |
|--------|--------|-----------|
| 연금술 | ⭐⭐⭐⭐ | 레시피 매칭, 힌트 알고리즘 |
| 전투 | ⭐⭐⭐⭐⭐ | 턴 기반, 상태 효과, 스킬 |
| 경제 | ⭐⭐⭐ | 재료 거래, 골드 순환 |
| 육성 | ⭐⭐⭐⭐ | 레벨링, 각성 |
| 시설 | ⭐⭐⭐ | 자동 생산, 오프라인 보상 |

---

## 참고 문서

- [게임 디자인 문서](./game_design_summary.md)
- [밸런스 가이드](./BALANCE_GUIDE.md)
- [리소스 플로우](./RESOURCE_FLOW.md)
- [AI 워크플로우](./.agent/rules/content-guide.md)

---

**문서 생성**: Claude Code SuperClaude
**분석 깊이**: Very Thorough
**분석 시간**: 2025-12-17
