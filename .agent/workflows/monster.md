---
description: Add or Modify a monster

---

1. OPEN [src/data/monsterData.ts](file:///Users/jwonkim/Workspace/gemtleMonster/src/data/monsterData.ts)
2. Add a new entry OR Edit an existing entry in the `MONSTER_DATA` object.
   > [!IMPORTANT]
   > **Do NOT use the `monster_` prefix for the ID.** Use a clean ID like `slime_fire`, not `monster_slime_fire`.

   ```typescript
   'monster_id': { // e.g. 'slime_fire' (NO 'monster_' prefix!)
       name: 'Monster Name',
       description: 'Description...',
       role: 'TANK', // or DPS, SUPPORT, HYBRID, PRODUCTION
       hp: 100,
       attack: 10,
       defense: 10,
       element: 'FIRE', // FIRE, WATER, EARTH, WIND, LIGHT, DARK, CHAOS
       rarity: 'N', // N, R, SR, SSR
       iconUrl: '/assets/monsters/monster_id.png'
   },
   ```
3. (Optional) Add image to `public/assets/monsters/`
4. RUN the seed script to update the database:
// turbo
5. `npm run seed:monsters`
