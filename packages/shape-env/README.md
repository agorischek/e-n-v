<!-- markdownlint-disable-next-line -->
<img src="./assets/direct-env-logo2.png" alt="Ask Env Logo" height="75"/>

# shape-env

Direct environment variable loading and validation with runtime type safety.

## Features

- 🔒 **Non-mutating**: Reads env vars without touching `process.env`
- ✅ **Validation**: Parse and validate using schemas (Zod, Joi, or native)
- 🔌 **Channel-based**: Load from files, dotenvx, or custom sources
- 🎯 **Type-safe**: Full TypeScript support with inferred types
- 🔧 **Preprocessing**: Normalize values before validation

## Installation

```bash
bun add shape-env
```

## Usage

### Basic Example

```typescript
import { parse, schema } from "shape-env";

const env = await parse({
  path: ".env",
  root: import.meta.url,
  vars: {
    PORT: schema.number({ default: 3000 }),
    DATABASE_URL: schema.string(),
    DEBUG: schema.boolean({ default: false }),
  }
});

console.log(env.PORT); // number
console.log(env.DATABASE_URL); // string
console.log(env.DEBUG); // boolean
```

### Using EnvMeta

```typescript
import { EnvMeta, parse } from "shape-env";

// Create reusable metadata
const meta = new EnvMeta({
  path: ".env.production",
  root: import.meta.url,
  vars: {
    API_KEY: schema.string(),
    MAX_CONNECTIONS: schema.number(),
  }
});

// Load multiple times without recreating metadata
const env1 = await parse(meta);
const env2 = await parse(meta, { strict: false });
```

### With Zod Schemas

```typescript
import { parse } from "shape-env";
import { z } from "zod";

const env = await parse({
  path: ".env",
  vars: {
    PORT: z.number().min(1024).max(65535),
    NODE_ENV: z.enum(["development", "production", "test"]),
    API_URL: z.string().url(),
  }
});
```

### With Custom Preprocessing

```typescript
import { parse, schema } from "shape-env";

const env = await parse(
  {
    path: ".env",
    vars: {
      PERCENTAGE: schema.number(),
      ENABLED: schema.boolean(),
    }
  },
  {
    preprocess: {
      number: (value) => value.replace(/%$/, ""), // Strip % suffix
      bool: (value) => value === "on" ? "true" : value,
    }
  }
);
```

### Using Different Channels

```typescript
import { parse } from "shape-env";
import { dotenvx } from "@dotenvx/dotenvx";

// Using dotenvx
const env = await parse({
  path: ".env.vault",
  channel: {
    dotenvx,
    get: { privateKey: process.env.DOTENV_PRIVATE_KEY }
  },
  vars: {
    SECRET: schema.string(),
  }
});
```

## API

### `parse(options)`

Load and validate environment variables.

**Parameters:**
- `options`: `DirectEnvOptions` - Configuration object
  - `source`: Source object containing environment variables
  - `vars`: Variable schemas
  - `preprocess`: Custom preprocessing functions (optional)
  - `strict`: Throw on missing required vars (default: `true`)

**Returns:** `T` - Validated environment variables

### `EnvMeta`

Container for environment variable metadata.

**Constructor:**
```typescript
new EnvMeta(options: EnvMetaOptions)
```

**Properties:**
- `channel`: `EnvChannel` - Channel for reading/writing
- `path`: `string` - Fully qualified file path
- `schemas`: `Record<string, EnvVarSchema>` - Resolved schemas
- `preprocess`: `Preprocessors | undefined` - Preprocessing functions

### `EnvMetaOptions`

Configuration for creating EnvMeta.

**Properties:**
- `path`: `string` - Path to env file
- `root`: `string | URL` - Root directory for resolving paths
- `vars`: `Record<string, SupportedSchema>` - Variable schemas
- `channel`: `EnvChannelOptions` - Channel configuration

## Error Handling

### Aggregate Errors

By default, `shape-env` validates **all** environment variables and collects errors before throwing. This gives you a complete picture of what's wrong instead of failing on the first error.

```typescript
import { parse, EnvValidationAggregateError } from "shape-env";

try {
  const env = await parse({
    path: ".env",
    vars: {
      PORT: schema.number(),
      DATABASE_URL: schema.string(),
      DEBUG: schema.boolean(),
      MAX_RETRIES: schema.number(),
    }
  });
} catch (error) {
  if (error instanceof EnvValidationAggregateError) {
    console.error(`Found ${error.errors.length} validation errors:`);
    console.error(`Missing: ${error.missingVars.join(", ")}`);
    console.error(`Invalid: ${error.invalidVars.join(", ")}`);
    
    // Get detailed error messages
    console.error("\nDetails:");
    console.error(error.getDetailedMessage());
  }
}
```

### Individual Error Types

The aggregate error contains individual error instances:

```typescript
import { MissingEnvVarError, ValidationError } from "shape-env";

if (error instanceof EnvValidationAggregateError) {
  error.errors.forEach(err => {
    if (err instanceof MissingEnvVarError) {
      console.error(`Missing required: ${err.key}`);
    } else if (err instanceof ValidationError) {
      console.error(`Invalid ${err.key}: ${err.value} - ${err.originalError}`);
    }
  });
}
```

### Non-Strict Mode

Set `strict: false` to allow missing/invalid values without throwing:

```typescript
const env = await parse({
  source: { /* ... */ },
  vars: { PORT: schema.number() },
  strict: false
});

// env.PORT will be undefined if missing or invalid
```

## License

MIT
