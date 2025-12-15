---
description: Add or Modify an alchemy recipe

---

1. OPEN [src/data/alchemyData.ts](file:///Users/jwonkim/Workspace/gemtleMonster/src/data/alchemyData.ts)
2. Add a new entry OR Edit an existing entry in the `DB_RECIPES_SEED` array.

   ```typescript
   {
       id: 'recipe_id',
       type: 'MONSTER', // 'MONSTER' or 'ITEM'
       resultMonsterId: 'monster_id', // Required if type is MONSTER
       // resultItemId: 'item_id', // Required if type is ITEM
       resultCount: 1,
       baseSuccessRate: 90,
       craftTimeSec: 60,
       costGold: 100,
       requiredAlchemyLevel: 1,
       expGain: 10,
       isHidden: false,
       priority: 100,
       ingredients: [
           { materialId: 'material_id', quantity: 1, isCatalyst: false }
       ],
       conditions: []
   },
   ```
3. RUN the seed script to update the database:
// turbo
4. `npm run seed:alchemy`
