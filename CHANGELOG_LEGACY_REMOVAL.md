# Legacy API Removal

## Summary

Removed all legacy APIs in favor of the new spec-based approach.

## Removed APIs

### From `e-n-v`
- ❌ `define()` function
- ❌ `load()` function  
- ❌ `setup()` function
- ❌ `EnvMeta` class
- ❌ `EnvMetaOptions` interface
- ❌ `/define`, `/load`, `/setup` package exports

### From `shape-env`
- ❌ `EnvDefinition` re-export
- ❌ `EnvDefinitionOptions` re-export
- ❌ `vars()` helper function re-export

### Removed Dependencies
- ❌ `@envcredible/define` dependency from `shape-env`

## New APIs

### `e-n-v`
- ✅ `spec()` - Create environment specifications
- ✅ `parse()` - Parse and validate (from shape-env)
- ✅ `prompt()` - Interactive setup (from prompt-env)
- ✅ `defaults` - Default configuration values
- ✅ `EnvSpec` / `EnvSpecOptions` types

### `shape-env` & `prompt-env`
- ✅ Accepts both `vars` (map of schemas) and `spec` (EnvSpec instance)
- ✅ Re-exports `EnvSpec`, `spec()`, `EnvSpecOptions`

## Migration Guide

### Before (Legacy API)
\`\`\`typescript
// env.meta.ts
import define from "e-n-v/define";
import { z } from "zod";

export const env = define({
  path: ".env",
  root: import.meta.url,
  vars: {
    PORT: z.number(),
  },
});

// env.ts
import { load } from "e-n-v";
import { env } from "./env.meta";

export const { PORT } = await load(env);

// env.setup.ts
import { setup } from "e-n-v";
import { env } from "./env.meta";

await setup(env, { secrets: ["API_KEY"] });
\`\`\`

### After (New API)
\`\`\`typescript
// env.spec.ts
import { spec } from "e-n-v";
import { z } from "zod";

export default spec({
  schemas: {
    PORT: z.number(),
  },
  preprocess: true,
});

// app.ts
import spec from "./env.spec.js";
import { parse } from "e-n-v";

export const env = parse({ 
  source: process.env as Record<string, string>, 
  spec 
});

// env.setup.ts
import spec from "./env.spec.js";
import { prompt, defaults } from "e-n-v";

await prompt({ 
  spec, 
  secrets: [...defaults.SECRET_PATTERNS, "API_KEY"],
  path: ".env",
});
\`\`\`

## Breaking Changes

1. **No more EnvMeta**: Replace with `EnvSpec` which focuses on schemas and preprocessing only
2. **No more path/channel in spec**: These are now provided directly to `prompt()` or handled by the consumer with `parse()`
3. **parse() is synchronous**: No async/await needed for `parse()` - it works directly on the source object
4. **Explicit source**: `parse()` requires an explicit `source` parameter instead of loading from a file
5. **Different preprocessing API**: `preprocess: true | false | Partial<Preprocessors>` instead of just `Preprocessors`

## Benefits

- ✅ Simpler mental model: spec → parse → prompt
- ✅ More explicit about data flow
- ✅ Better separation of concerns
- ✅ Easier to test (parse is synchronous)
- ✅ More flexible (source can be any object)
- ✅ Cleaner API surface

## Files Removed

- `/packages/e-n-v/src/define.ts`
- `/packages/e-n-v/src/load.ts`
- `/packages/e-n-v/src/setup.ts`
- `/packages/e-n-v/src/meta/EnvMeta.ts`
- `/packages/e-n-v/src/meta/EnvMetaOptions.ts`
- `/packages/e-n-v/examples/env.meta.ts`
- `/packages/e-n-v/examples/env.meta.dotenvx.ts`
- `/packages/e-n-v/examples/env.ts`
- `/packages/e-n-v/examples/env.setup.ts`
- `/packages/e-n-v/examples/app.ts`

## Files Updated

- All READMEs updated to show new API
- `IMPLEMENTATION.md` rewritten for new architecture
- Example files updated to use spec-based approach
