---
description: Add or Modify a material

---

1. OPEN [src/data/alchemyData.ts](file:///Users/jwonkim/Workspace/gemtleMonster/src/data/alchemyData.ts)
2. Add a new entry OR Edit an existing entry in the `MATERIALS` object.

   ```typescript
   'material_id': {
       id: 'material_id',
       name: 'Material Name',
       type: 'PLANT', // PLANT, MINERAL, LIQUID, MAGICAL, SPECIAL
       description: 'Description...',
       rarity: 'N', // N, R, SR, SSR
       iconUrl: '/assets/materials/material_id.png'
   },
   ```
3. CHECK [src/ui/ResourceIcon.tsx](file:///Users/jwonkim/Workspace/gemtleMonster/src/ui/ResourceIcon.tsx) and add the icon mapping to `RESOURCE_ICONS`.
4. (Optional) Add image to `public/assets/materials/`
5. RUN the seed script to update the database:
// turbo
6. `npm run seed:alchemy`
