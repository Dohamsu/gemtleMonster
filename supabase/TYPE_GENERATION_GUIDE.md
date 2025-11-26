# Supabase Type Generation Setup Guide

## Prerequisites

### 1. Install Supabase CLI
```bash
brew install supabase/tap/supabase
```

### 2. Set Environment Variables

Add to your `.env` file:
```bash
# Supabase Project Settings
SUPABASE_PROJECT_REF=your-project-ref-here  # e.g., "abcdefghijklmnop"
SUPABASE_ACCESS_TOKEN=your-access-token     # Optional, for remote type generation

# Existing variables
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

**Where to find these:**
- `SUPABASE_PROJECT_REF`: Dashboard → Project Settings → General → Reference ID
- `SUPABASE_ACCESS_TOKEN`: Dashboard → Account → Access Tokens → Generate new token

## Usage

### Generate Types from Remote DB (Recommended)
```bash
# One-time setup: export your project ref
export SUPABASE_PROJECT_REF=your-project-ref

# Generate types from production DB
npm run types:generate
```

### Generate Types from Local DB
```bash
# Start local Supabase (first time)
supabase start

# Generate types from local DB
npm run types:local
```

### Pull Latest Schema
```bash
# Pull schema changes from remote to local
npm run db:pull
```

### Push Local Changes to Remote
```bash
# Push local migrations to remote DB
npm run db:push
```

## Generated File

After running type generation, you'll have:
- `src/types/database.types.ts` - Auto-generated TypeScript types

## Usage in Code

```typescript
import { Database } from './types/database.types'

// Extract specific table types
type Recipe = Database['public']['Tables']['recipe']['Row']
type RecipeInsert = Database['public']['Tables']['recipe']['Insert']
type RecipeUpdate = Database['public']['Tables']['recipe']['Update']

// Use in your API functions
const recipe: Recipe = await supabase
  .from('recipe')
  .select('*')
  .single()
```

## Workflow

1. **After DB schema changes**: Run `npm run types:generate`
2. **Before committing**: Verify generated types match your expectations
3. **Update imports**: Use generated types instead of manual ones in `alchemyApi.ts`

## Notes

- Generated types use **snake_case** (matching DB columns)
- Keep `src/types/database.types.ts` in git for team consistency
- Re-generate after every migration or schema change
