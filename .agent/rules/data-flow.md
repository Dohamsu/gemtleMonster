---
trigger: model_decision
description: Visual guide and checklist for data flow when adding new game content.
---

# 🔄 Data Flow & Dependency Rules

This document visualize the flow of data from definition to UI rendering. Use this to ensure no steps are missed when adding new content.

## 🏗️ Facility Flow
When adding a new facility (`@/facility`), the data flows as follows:

```mermaid
graph TD
    A[src/data/idleConst.json] -->|Define ID, Stats, Costs| B(npm run seed:facilities)
    B -->|Upsert| C[(Supabase DB: facility/facility_level)]
    
    A -->|ID Reference| D[src/ui/FacilityIcon.tsx]
    D -->|Map ID to Image/Emoji| E[UI Display]
    
    A -->|ID Reference| F[src/game/renderers/mapRenderer.ts]
    F -->|Render Image on Canvas| G[Game Map]
    
    style A fill:#f9f,stroke:#333,stroke-width:2px
    style C fill:#bbf,stroke:#333,stroke-width:2px
    style E fill:#bfb,stroke:#333,stroke-width:2px
    style G fill:#bfb,stroke:#333,stroke-width:2px
```

**Checklist:**
1. Defined in JSON?
2. DB Seeded?
3. Icon Mapped?
4. Map Renderer Updated?

---

## 🧪 Material Flow
When adding a new material (`@/material`):

```mermaid
graph TD
    A[src/data/alchemyData.ts] -->|Define MATERIALS Object| B(npm run seed:alchemy)
    B -->|Upsert| C[(Supabase DB: material)]
    
    A -->|ID Reference| D[src/ui/ResourceIcon.tsx]
    H[public/assets/materials/*.png] -->|File Path| D
    D -->|Map ID to Image Path| E[Inventory/Shop UI]
    
    style A fill:#f9f,stroke:#333,stroke-width:2px
    style C fill:#bbf,stroke:#333,stroke-width:2px
    style E fill:#bfb,stroke:#333,stroke-width:2px
```

**Checklist:**
1. Defined in TS?
2. DB Seeded?
3. Image Exists?
4. Icon Mapped (Crucial)?

---

## 👹 Monster Flow
When adding a new monster (`@/monster`):

```mermaid
graph TD
    A[src/data/monsterData.ts] -->|Define Stats, Role| B(npm run seed:monsters)
    A2[src/data/monsterSkillData.ts] -->|Define Skills| B
    B -->|Upsert| C[(Supabase DB: monster/monster_skill)]
    
    A -->|ID Reference| D[Battle Logic]
    H[public/assets/monsters/*.png] -->|File Path| E[Dungeon/Battle UI]
    
    style A fill:#f9f,stroke:#333,stroke-width:2px
    style C fill:#bbf,stroke:#333,stroke-width:2px
    style E fill:#bfb,stroke:#333,stroke-width:2px
```

**Checklist:**
1. Data Defined?
2. Skills Defined?
3. DB Seeded?
4. Image Exists?

---

## 📜 Recipe Flow
When adding a new recipe (`@/recipe`):

```mermaid
graph TD
    A[src/data/alchemyData.ts] -->|Define DB_RECIPES_SEED| B(npm run seed:alchemy)
    B -->|Upsert| C[(Supabase DB: alchemy_recipe)]
    
    C -->|Load| D[src/ui/alchemy/RecipeList.tsx]
    D -->|Display| E[Alchemy Workshop UI]
    
    style A fill:#f9f,stroke:#333,stroke-width:2px
    style C fill:#bbf,stroke:#333,stroke-width:2px
    style E fill:#bfb,stroke:#333,stroke-width:2px
```

**Checklist:**
1. Recipe Defined?
2. Inputs/Outputs Valid?
3. DB Seeded?
