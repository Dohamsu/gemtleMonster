# 🛠️ 콘텐츠 추가 가이드 (Content Addition Guide)

게임 내 새로운 콘텐츠(시설, 재료, 몬스터, 레시피)를 추가할 때 수정해야 할 파일들과 그 연결 관계를 정리한 문서입니다. 추가 작업 시 이 체크리스트를 확인하여 누락을 방지하세요.

---

## 🏗️ 1. 시설 (Facility) 추가

시설을 추가할 때는 데이터 정의부터 UI 표시, DB 저장까지 여러 파일을 건드려야 합니다.

### 1. 데이터 정의 (⭐️⭐️⭐️)
- **파일**: `src/data/idleConst.json`
- **내용**: `id`, `name`, `levels`, `upgradeCost`, `dropRates` 등 시설의 스펙을 정의합니다.

### 2. DB 시딩 (⭐️⭐️⭐️)
- **파일**: `src/data/seedFacilities.ts`
- **내용**: 터미널에서 `npm run seed:facilities`를 실행하여 DB에 데이터를 반영해야 합니다.

### 3. 아이콘 매핑 (⭐️⭐️)
- **파일**: `src/ui/FacilityIcon.tsx`
- **내용**: 시설 ID(`id`)에 해당하는 아이콘(이미지 또는 이모지)을 매핑합니다.

### 4. 인게임 렌더링 (⭐️⭐️)
- **파일**: `src/game/renderers/mapRenderer.ts`
- **내용**: 게임 맵(Canvas) 상에서 시설이 그려질 위치(`x`, `y`)와 사용할 이미지를 정의합니다.

### 5. 번역/UI (⚠️ 중요)
- **파일**: `src/ui/idle/IdleFacilityItem.tsx`
- **내용**: **`RESOURCE_NAMES` 객체를 확인하세요.** 시설 업그레이드에 필요한 재료의 한글 이름이 없다면 반드시 추가해야 합니다.

---

## 🧪 2. 재료 (Material) 추가

새로운 아이템이나 재료를 추가할 때 가장 놓치기 쉬운 부분은 **UI 아이콘 매핑**입니다.

### 1. 데이터 정의 (⭐️⭐️⭐️)
- **파일**: `src/data/alchemyData.ts`
- **내용**: `MATERIALS` 객체에 새 재료의 `id`, `name`, `rarity`, `iconUrl` 등을 추가합니다.

### 2. DB 시딩 (⭐️⭐️⭐️)
- **파일**: `src/data/seedAlchemy.ts`
- **내용**: 터미널에서 `npm run seed:alchemy`를 실행합니다.

### 3. UI 아이콘 (⚠️ 필수)
- **파일**: `src/ui/ResourceIcon.tsx`
- **내용**: **`RESOURCE_ICONS` 객체에 `id`와 이미지 경로를 매핑하세요.** 이 과정이 없으면 UI에서 아이콘 대신 물음표(❓)가 표시됩니다.

### 4. 이미지 파일 (⭐️⭐️)
- **경로**: `public/assets/materials/[id].png`
- **내용**: 실제 이미지 파일이 해당 경로에 존재하는지 확인합니다.

---

## 👹 3. 몬스터 (Monster) 추가

### 1. 데이터 정의 (⭐️⭐️⭐️)
- **파일**: `src/data/monsterData.ts`
- **내용**: 몬스터의 스탯, 속성, 이름 등을 정의합니다.

### 2. 스킬 정의 (⭐️)
- **파일**: `src/data/monsterSkillData.ts`
- **내용**: 필요 시 몬스터의 고유 스킬을 정의합니다.

### 3. DB 시딩 (⭐️⭐️⭐️)
- **파일**: `src/data/seedMonsters.ts`
- **내용**: 터미널에서 `npm run seed:monsters`를 실행합니다.

### 4. 이미지 파일 (⭐️⭐️)
- **경로**: `public/assets/monsters/[id].png`
- **내용**: 몬스터 이미지를 추가합니다.

---

## 📜 4. 연금술 레시피 (Recipe) 추가

### 1. 데이터 정의 (⭐️⭐️⭐️)
- **파일**: `src/data/alchemyData.ts`
- **내용**: `DB_RECIPES_SEED` 배열에 레시피 정보(재료, 결과물, 제작 시간 등)를 추가합니다.

### 2. DB 시딩 (⭐️⭐️⭐️)
- **파일**: `src/data/seedAlchemy.ts`
- **내용**: 터미널에서 `npm run seed:alchemy`를 실행합니다.

---

## ✅ 요약 체크리스트

작업 후 다음 사항을 꼭 확인하세요:

- [ ] **데이터 정의**: JSON/TS 파일에 데이터를 추가했는가?
- [ ] **DB 시딩**: 시딩 스크립트(`npm run seed:all`)를 실행했는가?
- [ ] **UI 매핑**: `ResourceIcon.tsx`나 `FacilityIcon.tsx`에 ID를 등록했는가?
- [ ] **이미지 파일**: `public` 폴더에 이미지가 실제로 존재하는가?
