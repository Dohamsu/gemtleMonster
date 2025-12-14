# 📋 변경 이력

모든 주요 변경사항은 이 파일에 문서화됩니다.
## [0.3.2] - 2025-12-14

### ✨ 신규 기능
- **몬스터 다중 초월**: 초월 시 여러 재료 몬스터를 한 번에 선택하여 일괄 초월 가능.
  - UI에서 다중 선택 지원 (체크 표시, 초월 레벨 증가량 표시).
  - 재료 선택 시 현재 초월 레벨(★) 표시 추가.
  - 초월 성공 화면에 달성 레벨 표시 및 빛 효과 개선.

### 🐛 버그 수정
- **상점 구매 리프레시 문제 해결**: 구매 후 불필요한 `refreshInventory()` 호출 제거로 화면 깜빡임 해소.
- **상점 이중 클릭 방지**: 구매 버튼에 `isBuying` 상태 추가로 중복 구매 방지.

### 🔧 데이터 정리
- **재료 통합**: `질긴 가죽`(`hide_tough`)을 `부드러운 가죽`(`leather_beast`)으로 병합.
- **드롭 테이블 수정**: 곰 계열 몬스터가 `곰 가죽`(`bear_skin`) 드롭하도록 변경.

## [0.3.1] - 2025-12-14

### ✨ New Features (Shop System)
- **상점 구매 시스템**: 1분마다 갱신되는 5개의 무작위 물품을 구매할 수 있습니다.
  - **Random Rotation**: 희귀도(N, R, SR, SSR)에 따른 가중치 확률 적용. SR 등급 '예티의 털' 획득 가능.
  - **Buy/Sell UI**: 상점 탭을 [구매]와 [판매]로 분리.
  - **Timer**: 다음 갱신까지 남은 시간 표시.

## [0.3.0] - 2025-12-14

### 🐛 Critical Bug Fixes (Facility Disappearance)
- **Facility Disappearance Fixed**: 시설 업그레이드 시 DB 동기화 오류로 인해 시설이 사라지는 현상 해결.
  - **Sync Race Condition**: 동기화 중 발생한 업데이트가 누락되는 문제 해결 (스냅샷 패턴 적용).
  - **Offline Rewards Conflict**: 게임 시작 시 오프라인 보상 계산과 자동 수집이 동시에 실행되어 자원이 이중 차감되는 경쟁 상태 해결 (상호 배제 락 적용).
  - **Upgrade Timestamp Initialization**: 시설 업그레이드 직후 수집 시간이 초기화되지 않아 막대한 자원이 차감되는 문제 해결.
  - **Phantom Materials**: 일부 재료가 DB에 없는데 클라이언트에는 존재하는 데이터 불일치 자동 보정.
  - **Negative Balance Protection**: `batch_add_materials` DB 함수에 음수 방지 로직(GREATEST) 추가.

### 🔍 Debugging Tools
- **Enhanced Logging**: 배치 동기화, 자동 수집, 시설 업그레이드 주요 로직에 상세 로깅 추가.
- **Client-Server Data Verification**: `loadPlayerData` 시 서버 데이터와 클라이언트 데이터 비교 로깅 추가.

## [0.2.6] - 2025-12-13

### 🧪 Alchemy System Improvements
- **Craft Time Reduction**: 모든 레시피의 조합 시간을 대폭 단축하여 게임 진행 속도 향상.
- **Improved Hint System**:
  - '원소 공명' 힌트 제거 (직관성 개선).
  - 힌트에서 몬스터의 실제 이름(또는 '알 수 없는 몬스터') 명확히 표시.
  - **Progressive Reveal**: 힌트로 재료가 하나라도 밝혀지면, 목록에서 레시피 이름(몬스터 이름)이 즉시 공개됨.
  - **Duplicate Prevention**: 이미 밝혀낸 재료는 힌트 대상에서 제외.

  - **Guaranteed Success**: 레시피를 직접 선택하여 조합할 경우, 실패 확률 없이 100% 성공하도록 변경. (자유 조합 시에만 실패/힌트 발생)

### 💰 Shop Balancing
- **Item Prices**: 재료의 판매 가격을 전반적으로 조정.
  - 가공된 아이템(주괴 등)의 가치를 원재료(광석)보다 대폭 상향 (예: 철광석 15G → 철 주괴 200G).
  - 희귀도에 따른 가격 차등화 적용.
  - **DB Sync**: 상점 가격 데이터 베이스 동기화 완료 (구리 주괴 120G 등).

### 🎮 Content Updates
- **Dungeon Drops**: 게임 내에서 얻을 수 없었던 재료들을 던전 드랍 테이블에 추가.
  - 킹 슬라임: `왕관 파편`
  - 마그마 골렘: `불 던전 코어`
  - 호수의 요정: `특수 약초` 등.
  
## [0.2.5] - 2025-12-09

### ✨ New Features
- **Awakening System**: 몬스터 초월 시스템 추가 (최대 5성).
  - 동일한 몬스터를 재료로 사용하여 스탯 강화.
  - 초월 레벨에 따른 별(★) 표시 및 상세 정보 UI.
- **New Materials**: 속성 파편(불, 물, 대지, 바람, 빛, 어둠) 및 몬스터 정수 아이템 추가.

### 🎨 UI/UX Improvements
- **Awakening UI**: 초월 성공 시 화려한 연출 애니메이션 추가.
- **Mobile Optimization**: 몬스터 상세 정보 모달이 모바일 환경에서 잘려 보이지 않도록 스크롤 및 레이아웃 개선.
- **Visuals**: 속성 파편 아이템에 직관적인 이미지 적용.

### 🎮 Content Updates
- **Dungeon Drops**:
  - 화산 요새: '불의 파편' 드랍 추가.
  - 천공의 탑: '바람의 파편' 드랍 추가.
  - 전역 드랍: 모든 던전 몬스터가 낮은 확률로 '몬스터 정수' 드랍.

## [0.2.4] - 2025-12-07
### ✨ New Features
- **UI Overlay**: Added current gold display below player ID.
- **New Dungeons**: Added 'Volcano Dungeon' and 'Sky Dungeon' to `dungeonData.ts` with relevant monsters.
- **New Monsters**: Added Fire Slime, Magma Golem, Cloud Slime, etc., with images.

### 🎨 Assets & UI
- **Alchemy**: Fixed 'Back' button unresponsive issue by adding `pointerEvents: 'auto'`.
- **Assets**: Added icon images for new dungeons and monsters.
- **Images**: Updated `monsterData` to use correct local assets (Cloud Slime, Sky Dragon, etc.).

## [0.2.3] - 2025-12-06

### ♻️ Refactoring
- **Alchemy UI**:
  - Converted "Start Brewing" button to React component (`AlchemyBrewButton`).
  - Converted "Back" button to React component (`AlchemyBackButton`).
  - Removed legacy canvas rendering and click handling for these buttons.

### 🐛 Bug Fixes
- **Alchemy**: Fixed an issue where the brewing process would hang at 100% progress.
- **Shop**: Fixed an issue where gold was not correctly updated after selling items.

## [0.2.2] - 2025-12-01

### ✨ New Features
- **New Dungeon**: Added 'Mystic Lake' (신비한 호수) dungeon.
- **New Monsters**: Added Water Slime, Lake Fairy, Giant Water Slime, etc.
- **UI Improvements**:
  - Added dungeon selection modal.
  - Displayed monster images in battle view and dungeon modal.
  - Localized battle loot logs (Korean).

### 🐛 Bug Fixes
- Fixed issue where monster names appeared as 'Unknown' in battle.
- Synced missing enemy data in `monsterData.ts`.

## [0.2.1] - 2025-11-25

### ✨ New Features
- Added game constants file `src/constants/game.ts`.
- Updated material sell price field in `src/lib/alchemyApi.ts`.
- Added new UI assets for monsters.
- Refactored alchemy store and UI components.
- Updated linting and formatting configurations.

### 🐛 Bug Fixes
- Fixed ingredient removal logic.
- Fixed UI text inconsistencies.


## [0.2.0] - 2025-01-XX

### ✨ 새로운 기능

#### 🧪 연금술 시스템 완전 구현
- **데이터베이스 스키마 구축**
  - 8개 테이블로 구성된 완전한 연금술 시스템
  - Row Level Security (RLS) 정책 적용
  - 재료 관리 헬퍼 함수 (`consume_materials`, `add_materials`)

- **마스터 데이터**
  - 23종의 재료 (5개 계열: PLANT, MINERAL, BEAST, SLIME, SPIRIT)
  - 10개의 레시피 (기본 7개 + 숨겨진 3개)
  - 등급 시스템 (COMMON, UNCOMMON, RARE, EPIC, LEGENDARY)

- **API 레이어**
  - `alchemyApi.ts` - Supabase 연동 함수
  - TypeScript 인터페이스로 타입 안정성 확보
  - 재료 추가/소비, 레시피 조회, 제작 기록 등 모든 CRUD 작업

- **상태 관리**
  - `useAlchemyStore` - Zustand 기반 전역 상태 관리
  - 재료 선택, 레시피 선택, 제작 진행 상태 관리
  - 실시간 진행률 추적 및 애니메이션

#### 🎨 캔버스 기반 연금술 공방 UI
- **인터랙티브 캔버스 렌더링**
  - 왼쪽 패널: 레시피 목록 (클릭으로 선택)
  - 중앙: 연금솥 애니메이션
  - 오른쪽 패널: 보유 재료 (클릭으로 추가)
  - 하단: 연금술 시작 버튼 (재료 충족 시 활성화)

- **실시간 UI 업데이트**
  - 선택된 재료 / 필요 재료 표시 (예: "일반 약초 2/2")
  - 제작 중 진행바 애니메이션
  - 성공/실패 알림

- **맵 시스템 통합**
  - 맵 뷰에서 연금술 공방 클릭 시 공방 진입
  - 뒤로가기 버튼으로 맵으로 복귀

#### 🛠️ 개발자 도구
- **시드 스크립트**
  - `seedAlchemy.ts` - 초기 데이터 자동 입력
  - `npm run seed:alchemy` 명령어로 실행

- **테스트 기능**
  - "테스트 재료 추가" 버튼으로 빠른 테스트
  - 콘솔 로그를 통한 디버깅

### 🔧 개선사항

#### 상태 관리 리팩토링
- **재료 체크 로직 분리**
  - `canCraft()` - 선택된 재료 기준 제작 가능 여부
  - `canCraftWithMaterials()` - 보유 재료 기준 제작 가능 여부
  - 추천 탭 필터링 정확도 향상

- **자동 배치 기능**
  - `autoFillIngredients()` - 필요 재료 자동 배치
  - 재료 부족 시 명확한 에러 메시지

#### UI/UX 개선
- **용어 통일**
  - "일반 허브" → "일반 약초"로 일관성 있게 변경
  - 모든 UI 텍스트 한글화

- **GameCanvas 최적화**
  - useAlchemyStore 통합으로 상태 일관성 확보
  - 이전 시스템 제거로 코드 단순화

### 🐛 버그 수정

- **재료 검증 오류 수정**
  - 이슈: GameCanvas에서 구 시스템(`useGameStore.resources`) 사용으로 "NOT ENOUGH" 오류
  - 해결: `useAlchemyStore`로 완전 마이그레이션

- **자동 배치 버튼 미작동 수정**
  - 이슈: `canCraft()` 함수가 잘못된 상태 체크
  - 해결: `canCraft()`와 `canCraftWithMaterials()` 분리

- **추천 탭 필터링 오류 수정**
  - 이슈: 선택된 재료 기준으로 필터링
  - 해결: 보유 재료 기준으로 수정

### 📦 파일 변경사항

#### 새로 추가된 파일
```
supabase/alchemy_schema.sql          # 데이터베이스 스키마
src/data/alchemyData.json            # 마스터 데이터
src/data/seedAlchemy.ts              # 시드 스크립트
src/lib/alchemyApi.ts                # API 레이어
src/store/useAlchemyStore.ts         # 상태 관리
src/ui/RecipePanel.tsx               # 레시피 패널 (사용 안 함)
src/ui/InventoryPanel.tsx            # 인벤토리 패널 (사용 안 함)
public/assets/alchemy_workshop.png   # 연금술 공방 이미지
```

#### 수정된 파일
```
src/game/GameCanvas.tsx              # 캔버스 연금술 UI 통합
src/store/useGameStore.ts            # 캔버스 뷰 상태 관리
src/ui/UIOverlay.tsx                 # 용어 통일
src/ui/alchemy/AlchemyLayout.tsx     # 레이아웃 구조
src/ui/alchemy/CauldronPanel.tsx     # 상태 관리 통합
package.json                         # 시드 스크립트 추가
```

### 🗑️ 제거 예정
- `src/ui/RecipePanel.tsx` - 캔버스 UI로 대체
- `src/ui/InventoryPanel.tsx` - 캔버스 UI로 대체
- `src/ui/alchemy/AlchemyLayout.tsx` - 향후 제거 가능

### 📚 문서화
- README.md 작성 (프로젝트 소개, 설치 가이드, 게임 플레이 가이드)
- CHANGELOG.md 작성 (상세 변경 이력)

---

## [0.1.0] - 2025-01-XX

### ✨ 초기 릴리스

#### 기본 게임 시스템
- **시설 관리**
  - 약초 농장 (Lv.1 시작)
  - 광산 (업그레이드 가능)

- **리소스 시스템**
  - 골드, 약초, 광석 등 기본 리소스
  - 리소스 획득 애니메이션

- **사용자 인증**
  - Supabase Auth 통합
  - 자동 저장 시스템

- **UI 프레임워크**
  - Canvas 기반 맵 렌더링
  - React 기반 오버레이 UI
  - 탭 시스템 (시설 관리, 상점)

#### 기술 스택
- React 18 + TypeScript
- Vite 빌드 시스템
- Zustand 상태 관리
- Supabase 백엔드

---

## 버전 관리 규칙

이 프로젝트는 [Semantic Versioning](https://semver.org/)을 따릅니다:

- **MAJOR** (1.0.0): 호환되지 않는 API 변경
- **MINOR** (0.1.0): 하위 호환되는 기능 추가
- **PATCH** (0.0.1): 하위 호환되는 버그 수정

### 변경사항 분류
- ✨ **새로운 기능**: 새로운 기능 추가
- 🔧 **개선사항**: 기존 기능 개선
- 🐛 **버그 수정**: 버그 및 오류 수정
- 📚 **문서화**: 문서 관련 변경
- 🎨 **UI/UX**: 사용자 인터페이스 개선
- ⚡ **성능**: 성능 최적화
- 🗑️ **제거**: 기능 또는 파일 제거
- 🔒 **보안**: 보안 관련 수정
