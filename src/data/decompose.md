# 몬스터 분해 시스템 기획서 (Project Adapted)

## 1. 시스템 개요

몬스터 분해 시스템은 **남는 몬스터를 재료/에센스 등으로 환원**하여  
플레이어가 연금술/시설/파견 등 다른 컨텐츠를 지속적으로 돌릴 수 있게 해주는 자원 순환 구조이다.

- 주요 목적
  - 인벤토리 압박 완화
  - 남는 몬스터에 용도를 부여
  - 게임 내 재화/재료 순환 구조 형성
  - 연금술/시설 성장 동력 제공

---

## 2. 전제 환경 및 요구사항

현재 프로젝트 구조에 맞춰 다음 요소들의 추가/확인이 필요하다.

- **몬스터 데이터 (`player_monster`)**
  - 현재 구조: `{ id, monster_id, level, exp, created_at }`
  - **추가 필요**: `locked` (잠금 여부) 필드 DB 추가 필요.
  - **상태 확인**: `deployed` 상태는 별도 컬럼보다는 `Facility`나 `Party` 데이터에서 해당 몬스터 ID가 사용 중인지 확인하는 방식으로 구현 권장.

- **인벤토리 및 재료**
  - **신규 재료 추가 필요**:
    - `essence`: 몬스터 정수 (공용 자원)
    - `shard_fire`, `shard_water`, `shard_earth`, `shard_wind`: 속성 파편
  - 기존 재료 활용: `gem_fragment`, `spirit_dust` 등을 보조 보상으로 활용 가능.

---

## 3. 용어 정의

- **분해(Disassemble / Dismantle)**  
  플레이어가 보유한 몬스터를 소멸시키고, 대신 재료/에센스/파편 등의 보상을 얻는 행위.

- **Essence(에센스)**  
  신규 추가될 재료. 연금술 촉매나 상위 조합에 사용됨.

- **속성 파편(Shard)**  
  신규 추가될 재료. 몬스터의 속성(Element)에 대응하는 파편.

---

## 4. 분해 가능 조건

몬스터가 분해 대상이 되기 위해서는 다음 조건을 만족해야 한다.

1. **배치/파견 중인 몬스터 금지**
   - `useGameStore` 또는 `useFacilities` 상태 확인
   - 현재 시설에 배치되어 있거나(`assignedMonsterId`), 파티에 포함된 몬스터는 분해 불가.

2. **잠금/보호 상태 금지**
   - `locked === true` 인 몬스터 분해 불가.
   - (구현 시 `player_monster` 테이블에 `is_locked` 컬럼 추가 필요)

3. **유저 소유 여부 확인**
   - `user_id` 일치 여부 검증.

---

## 5. 분해 보상 설계 (구체안)

### 5.1. 보상 테이블 매핑

기존 `MATERIALS` 데이터와 신규 추가될 재료를 조합하여 보상을 구성한다.

| 등급 | 기본 보상 (확정) | 추가 보상 (확률/선택) | Essence (확정) |
|:---:|:---|:---|:---:|
| **N** | `slime_fluid` / `beast_fang` (타입별 상이) × 1~2 | `herb_common` × 1 | 1 |
| **R** | `ore_iron` / `spirit_dust` × 2~3 | **속성 파편** × 1 | 3 |
| **SR** | `ore_magic` / `gem_fragment` × 2 | **속성 파편** × 3 | 10 |
| **SSR** | `ancient_relic_fragment` × 1 | **속성 파편** × 5 | 30 |

* **속성 파편 매핑**:
  - Fire → `shard_fire`
  - Water → `shard_water`
  - Earth → `shard_earth`
  - Wind → `shard_wind`
  - Light/Dark → `shard_light` / `shard_dark` (또는 `gem_fragment`로 대체 가능)

---

## 6. 분해 처리 플로우 (구현 관점)

### 6.1. API 요청 (`decomposeMonsters`)

- **Input**: `monster_uids` (분해할 몬스터의 고유 DB ID 목록 `bigint[]` 또는 `string[]`)

### 6.2. 서버 사이드 로직 (Supabase RPC 권장)

1. **유효성 검사**:
   - 요청한 `monster_uids`가 해당 유저의 소유인지 확인.
   - `is_locked` 컬럼 확인.
   - (배치 여부는 클라이언트에서 1차 필터링하되, 서버에서도 시설/파티 테이블 조인하여 2차 검증 권장)

2. **보상 계산**:
   - 각 몬스터의 `monster_id`를 통해 `rarity`, `element`, `type` 조회.
   - 위 보상 테이블에 따라 총 보상 합산.

3. **트랜잭션 실행**:
   - `player_monster` 테이블에서 해당 row 삭제 (`DELETE`).
   - `player_material` 테이블에 보상 아이템 `INSERT` / `UPDATE`.
   - `player_alchemy` (혹은 재화 테이블)에 Essence 추가.

4. **결과 반환**:
   - 획득한 총 아이템 목록 반환.

---

## 7. UI/UX 설계 포인트

- **인벤토리 탭 분리**: `AlchemyLayout.tsx`의 인벤토리 탭에 '분해 모드' 토글 버튼 추가.
- **일괄 선택**: 등급별 일괄 선택 기능 제공.
- **잠금 기능**: 몬스터 상세 정보 팝업에 '잠금(Lock)' 버튼 추가하여 실수 방지.

---

## 8. 구현 체크리스트

### 8.1. DB 마이그레이션 적용

**파일 위치**: `supabase/migrations/20241128_decompose_system.sql`

이 마이그레이션은 다음을 수행합니다:
- `player_monster` 테이블에 `is_locked BOOLEAN DEFAULT FALSE` 컬럼 추가
- `decompose_monsters(p_user_id, p_monster_uids)` RPC 함수 생성

**적용 방법**:
```bash
# Supabase CLI 사용
supabase db push

# 또는 Supabase Dashboard에서 SQL Editor로 파일 내용 실행
```

### 8.2. 신규 재료 동기화

**추가된 재료**:
- `essence`: 몬스터 정수
- `shard_fire`, `shard_water`, `shard_earth`, `shard_wind`: 속성 파편
- `shard_light`, `shard_dark`: 빛/어둠 파편

**동기화 방법**:
1. 브라우저 콘솔을 엽니다
2. `window.syncMaterials()` 실행
3. 성공 메시지 확인

### 8.3. 클라이언트 로직 (향후 작업)

1. [ ] `useAlchemyStore`에 `decomposeMonsters` 액션 추가
2. [ ] 분해 UI 컴포넌트 구현 (선택, 미리보기, 확인)
3. [ ] 몬스터 인벤토리에 잠금 기능 추가

---

이 문서는 프로젝트의 현재 리소스 및 DB 구조를 반영하여 수정되었습니다.
