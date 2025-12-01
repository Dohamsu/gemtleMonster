# 코드 스타일 가이드

프로젝트 전체의 일관성을 위한 코드 스타일 가이드입니다.

## Import 순서

### 1. React/외부 라이브러리
```typescript
import { create } from 'zustand'
import React, { useState, useEffect } from 'react'
```

### 2. 타입 Import (type-only)
```typescript
import type { Material, Recipe, PlayerMonster } from '../types'
```

### 3. 내부 모듈 - 절대 경로순
```typescript
import * as alchemyApi from '../lib/alchemyApi'
import { calculateFailureExp } from '../utils/alchemyUtils'
import { ALCHEMY, RARITY_EXP } from '../constants/game'
import { MATERIALS } from '../data/alchemyData'
```

### 4. 상대 경로 Import
```typescript
import { useGameStore } from './useGameStore'
import { supabase } from './supabase'
```

## 네이밍 컨벤션

### 파일명
- **컴포넌트**: PascalCase (예: `GameCanvas.tsx`, `AlchemyPanel.tsx`)
- **Hook**: camelCase with 'use' prefix (예: `useGameStore.ts`, `useAuth.ts`)
- **Utils**: camelCase (예: `alchemyUtils.ts`, `syncMaterials.ts`)
- **Types**: camelCase (예: `material.ts`, `recipe.ts`)
- **Constants**: camelCase (예: `game.ts`)
- **API**: camelCase with API suffix (예: `materialApi.ts`, `recipeApi.ts`)

### 변수명
- **상수**: UPPER_SNAKE_CASE
  ```typescript
  const ALCHEMY = { XP_PER_LEVEL: 100 }
  const RARITY_EXP = { N: 10, R: 20 }
  ```

- **변수/함수**: camelCase
  ```typescript
  const playerMaterials = {}
  function calculateFailureExp() {}
  ```

- **타입/인터페이스**: PascalCase
  ```typescript
  interface Material {}
  type PlayerMonster = {}
  ```

- **컴포넌트**: PascalCase
  ```typescript
  function GameCanvas() {}
  ```

### 함수명
- **순수 함수**: 동사 + 명사 (예: `calculateLevel`, `getMaterials`)
- **Hook**: `use` + 명사 (예: `useAuth`, `useGameStore`)
- **이벤트 핸들러**: `handle` + 이벤트명 (예: `handleClick`, `handleSubmit`)
- **불린 반환**: `is/has/can` + 형용사/명사 (예: `isValid`, `hasPermission`, `canCraft`)

## 주석 스타일

### JSDoc 주석 (공개 API)
```typescript
/**
 * 재료 수량 추가
 *
 * @param userId - 사용자 ID
 * @param materialId - 재료 ID
 * @param quantity - 추가할 수량
 */
export async function addMaterialToPlayer(
  userId: string,
  materialId: string,
  quantity: number
): Promise<void> {
  // ...
}
```

### 인라인 주석
```typescript
// 실패 시에는 계산된 경험치의 일정 비율만 획득
const finalExp = Math.floor(totalExp * ALCHEMY.FAILURE_EXP_MULTIPLIER)
```

### 레거시 코드 마킹
```typescript
/**
 * @deprecated 이 함수는 레거시입니다. useAlchemyStore.sellMaterial을 사용하세요.
 */
```

## 코드 구조

### Store 파일 구조
```typescript
// 1. Imports
import { create } from 'zustand'
import type { ... } from '../types'

// 2. 타입 정의
interface StoreState {
  // ...
}

// 3. Store 생성
export const useStore = create<StoreState>((set, get) => ({
  // 4. 초기 상태
  data: [],

  // 5. Actions
  loadData: async () => { },
}))
```

### API 파일 구조
```typescript
// 1. 파일 설명 주석
/**
 * Material API
 * 재료 관련 데이터베이스 작업
 */

// 2. Imports
import { supabase } from './supabase'
import type { Material } from '../types'

// 3. 함수 정의 (도메인 그룹별)
// Get functions
export async function getAllMaterials() { }
export async function getMaterialById() { }

// Add functions
export async function addMaterialToPlayer() { }

// Update functions
export async function updateMaterial() { }
```

## TypeScript 컨벤션

### 타입 vs Interface
- **Interface**: 객체 구조 정의
  ```typescript
  interface Material {
    id: string
    name: string
  }
  ```

- **Type**: Union, Intersection, Utility 타입
  ```typescript
  type MaterialFamily = 'PLANT' | 'MINERAL' | 'BEAST'
  type Optional<T> = T | null
  ```

### 명시적 타입 선언
```typescript
// Good: 명시적 타입
const materials: Material[] = []
function getMaterial(id: string): Material | null { }

// Bad: any 사용 금지
const data: any = {}
```

## 에러 처리

### API 함수
```typescript
export async function getMaterials(): Promise<Material[]> {
  const { data, error } = await supabase
    .from('material')
    .select('*')

  if (error) {
    console.error('재료 목록 로드 실패:', error)
    throw error
  }

  return data || []
}
```

### Store 함수
```typescript
loadData: async () => {
  try {
    const data = await api.getData()
    set({ data })
  } catch (error) {
    console.error('데이터 로드 실패:', error)
    set({ error: error instanceof Error ? error.message : 'Unknown error' })
  }
}
```

## 비동기 처리

### Async/Await 사용
```typescript
// Good
async function loadData() {
  const materials = await getMaterials()
  const recipes = await getRecipes()
  return { materials, recipes }
}

// Bad: Promise then 체인
function loadData() {
  return getMaterials()
    .then(materials => getRecipes()
      .then(recipes => ({ materials, recipes })))
}
```

### 병렬 처리
```typescript
// Good: Promise.all 사용
const [materials, recipes, monsters] = await Promise.all([
  getMaterials(),
  getRecipes(),
  getMonsters()
])

// Bad: 순차 처리
const materials = await getMaterials()
const recipes = await getRecipes()
const monsters = await getMonsters()
```

## 폴더 구조

```
src/
├── components/     # React 컴포넌트
├── constants/      # 상수 정의
├── data/          # 정적 데이터
├── hooks/         # Custom hooks
├── lib/           # 외부 라이브러리 래퍼 및 API
├── store/         # Zustand stores
├── types/         # TypeScript 타입 정의
├── ui/            # UI 컴포넌트
└── utils/         # 유틸리티 함수
```
