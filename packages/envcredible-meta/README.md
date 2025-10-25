# @envcredible/meta

Metadata container for environment variable configuration in the envcredible ecosystem.

## Purpose

`EnvMeta` encapsulates all the configuration needed to load environment variables:
- Channel configuration (where to read/write env vars)
- File path resolution (with support for relative paths and file:// URLs)
- Schema resolution (converting various schema types to EnvVarSchema)
- Preprocessing options (optional)

This package is designed to be reusable across different loading strategies (interactive prompts, direct loading, etc.).

## Installation

```bash
bun add @envcredible/meta
```

## Usage

### Basic Usage

```typescript
import { EnvMeta, schema } from "@envcredible/meta";

const meta = new EnvMeta({
  path: ".env",
  root: import.meta.url,
  vars: {
    PORT: schema.number(),
    DATABASE_URL: schema.string(),
    DEBUG: schema.boolean(),
  }
});

// Access the resolved configuration
console.log(meta.path);     // Fully qualified path
console.log(meta.channel);  // EnvChannel instance
console.log(meta.schemas);  // Resolved EnvVarSchema objects
```

### With Zod Schemas

```typescript
import { EnvMeta } from "@envcredible/meta";
import { z } from "zod";

const meta = new EnvMeta({
  path: ".env.production",
  vars: {
    PORT: z.number().min(1024),
    API_URL: z.string().url(),
    NODE_ENV: z.enum(["development", "production", "test"]),
  }
});
```

### With Custom Channels

```typescript
import { EnvMeta } from "@envcredible/meta";
import { dotenvx } from "@dotenvx/dotenvx";

const meta = new EnvMeta({
  path: ".env.vault",
  channel: {
    dotenvx,
    get: { privateKey: process.env.DOTENV_PRIVATE_KEY }
  },
  vars: {
    SECRET_KEY: schema.string(),
  }
});
```

### Reusable Configuration

```typescript
import { EnvMeta } from "@envcredible/meta";

// Create once
const meta = new EnvMeta({
  path: ".env",
  root: import.meta.url,
  vars: { /* ... */ }
});

// Reuse across different loading contexts
import { load } from "direct-env";
const env1 = await load(meta);
const env2 = await load(meta, { strict: false });

import { ask } from "ask-env";
await ask(meta.schemas, { channel: meta.channel, path: meta.path });
```

## API

### `EnvMeta`

Container class for environment variable metadata.

**Constructor:**
```typescript
new EnvMeta(options: EnvMetaOptions)
```

**Properties:**
- `channel: EnvChannel` - Channel for reading/writing environment variables
- `path: string` - Fully qualified path to the env file
- `schemas: Record<string, EnvVarSchema>` - Resolved environment variable schemas
- `preprocess?: Preprocessors` - Optional preprocessing functions

### `EnvMetaOptions`

Configuration interface for creating EnvMeta instances.

**Properties:**
- `path: string` - Relative or absolute path to env file
- `root?: string | URL` - Root directory for path resolution (supports `import.meta.url`, `__dirname`, or file:// URLs)
- `vars: Record<string, SupportedSchema>` - Variable schemas (Zod, Joi, or native)
- `channel?: EnvChannelOptions` - Channel configuration

## Path Resolution

The `root` option supports multiple formats:

```typescript
// ESM: file:// URL from import.meta.url
new EnvMeta({ path: ".env", root: import.meta.url, vars: {...} });

// CommonJS: directory path
new EnvMeta({ path: ".env", root: __dirname, vars: {...} });

// Explicit file:// URL
new EnvMeta({ path: ".env", root: "file:///app/src/index.ts", vars: {...} });

// No root: uses path as-is
new EnvMeta({ path: "/absolute/path/.env", vars: {...} });
```

## Integration

Used by:
- `direct-env` - Load env vars directly without mutation
- `ask-env` - Interactive env file setup (potential future integration)
- Custom loading strategies in the envcredible ecosystem

## License

MIT
