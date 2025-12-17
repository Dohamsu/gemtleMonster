---
description: Add or Modify a material
---

1. OPEN [src/data/alchemyData.ts](file:///e:/gemtlMonster/gemtleMonster/src/data/alchemyData.ts)
2. Add a new entry OR Edit an existing entry in the `MATERIALS` object.

   ```typescript
   'material_id': {
       id: 'material_id',
       name: 'Material Name',
       type: 'PLANT', // PLANT, MINERAL, LIQUID, MAGICAL, SPECIAL, BEAST, SPIRIT
       description: 'Description...',
       rarity: 'N', // N, R, SR, SSR
       iconUrl: '/assets/materials/material_id.png',
       sellPrice: 10 // Optional, but recommended for shop
   },
   ```
3. CHECK [src/ui/ResourceIcon.tsx](file:///e:/gemtlMonster/gemtleMonster/src/ui/ResourceIcon.tsx) and add the icon mapping to `RESOURCE_ICONS`.
   > [!WARNING]
   > If you skip this, the item will show as a generic question mark (❓) in the UI.

4. (Optional) Check and Add image to `public/assets/materials/`
   - Ensure the file `e:/gemtlMonster/gemtleMonster/public/assets/materials/material_id.png` exists.
   
5. RUN the seed script to update the database:
// turbo
6. `npm run seed:alchemy`
