---
description: Add or Modify a facility
---

1. OPEN [src/data/idleConst.json](file:///e:/gemtlMonster/gemtleMonster/src/data/idleConst.json)
2. Add a new facility entry in the `facilities` array.
   - Define `id`, `name`, `unlockConditions`, and `levels` (stats, upgradeCost).

3. RUN the seed script to update the database:
// turbo
4. `npm run seed:facilities`

5. CHECK [src/ui/FacilityIcon.tsx](file:///e:/gemtlMonster/gemtleMonster/src/ui/FacilityIcon.tsx)
   - Add the new facility ID to `getFacilityIconUrl` function or `getIconContent` fallback.

6. CHECK [src/game/renderers/mapRenderer.ts](file:///e:/gemtlMonster/gemtleMonster/src/game/renderers/mapRenderer.ts)
   - Add rendering logic for the new facility in `renderMapView` (position, image).

7. CHECK [src/ui/idle/IdleFacilityItem.tsx](file:///e:/gemtlMonster/gemtleMonster/src/ui/idle/IdleFacilityItem.tsx)
   - Ensure specific translations or UI logic exists if needed (e.g., `RESOURCE_NAMES`).
