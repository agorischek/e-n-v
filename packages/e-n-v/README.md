# e-n-v

**"Environments, niftily? Very!"**

A unified, elegant API for environment variable management that combines definition, loading, and interactive setup into a cohesive workflow.

## Philosophy

`e-n-v` provides three distinct stages for working with environment variables:

1. **Define** (`env.meta.ts`) - Declare your environment schema once
2. **Load** (`env.ts`) - Load and validate at runtime
3. **Setup** (`env.setup.ts`) - Interactive configuration for development

## Installation

```bash
bun add e-n-v
```

## Usage

### 1. Define Your Environment (env.meta.ts)

Create a reusable environment metadata definition:

```typescript
import define from "e-n-v/define";
import { z } from "zod";

export const env = define({
  path: ".env",
  root: import.meta.url,
  vars: {
    DATABASE_URL: z.string().url(),
    PORT: z.number().min(1024).max(65535),
    NODE_ENV: z.enum(["development", "production", "test"]),
    API_KEY: z.string().min(32),
  },
  channel: { name: "default" }, // or { process }, { dotenvx }, etc.
});
```

### 2. Load at Runtime (env.ts)

Load and validate your environment variables:

```typescript
import { load } from "e-n-v";
import { env } from "./env.meta";

// Load and destructure - fully type-safe!
export const { DATABASE_URL, PORT, NODE_ENV, API_KEY } = await load(env);
```

### 3. Use in Your App (app.ts)

Import and use your validated environment:

```typescript
import { DATABASE_URL, PORT } from "./env";

console.log(`Connecting to ${DATABASE_URL}`);
console.log(`Server will run on port ${PORT}`);
```

### 4. Interactive Setup (env.setup.ts)

Create an interactive setup script for development:

```typescript
import { setup, defaults } from "e-n-v";
import { env } from "./env.meta";
import * as color from "picocolors";

await setup(env, {
  theme: color.cyan,
  secrets: [...defaults.secrets, "API_KEY"],
  truncate: 50,
});
```

Run it to configure your environment:

```bash
bun run env.setup.ts
```

## Advanced Usage

### Custom Channel - process.env

```typescript
import define from "e-n-v/define";

export const env = define({
  path: ".env", // ignored when using process channel
  vars: { PORT: z.number() },
  channel: { name: "process" }, // reads from process.env
});
```

### Custom Channel - dotenvx

```typescript
import define from "e-n-v/define";
import { dotenvx } from "@dotenvx/dotenvx";

export const env = define({
  path: ".env.vault",
  vars: { SECRET: z.string() },
  channel: {
    dotenvx,
    get: { privateKey: process.env.DOTENV_PRIVATE_KEY }
  },
});
```

### Custom Preprocessing

```typescript
import { load } from "e-n-v";
import { env } from "./env.meta";

const config = await load(env, {
  preprocess: {
    number: (value) => value.replace(/,/g, ""), // strip commas
    bool: (value) => value === "on" ? "true" : value,
  },
});
```

### Non-Strict Mode

```typescript
const config = await load(env, {
  strict: false, // missing/invalid vars return undefined instead of throwing
});
```

### Using Native Schemas

```typescript
import define, { schema } from "e-n-v/define";

export const env = define({
  path: ".env",
  root: import.meta.url,
  vars: {
    PORT: schema.number({ default: 3000 }),
    DEBUG: schema.boolean({ default: false }),
    API_URL: schema.string(),
    LOG_LEVEL: schema.enum({
      values: ["debug", "info", "warn", "error"] as const
    }),
  },
});
```

## API Reference

### `define(options)`

Define environment variable metadata.

**Parameters:**
- `options.path` - Path to env file
- `options.root` - Root directory (import.meta.url, __dirname, etc.)
- `options.vars` - Variable schemas (Zod, Joi, or native)
- `options.channel` - Channel configuration (default, process, dotenvx)

**Returns:** `EnvMeta` instance

### `load(meta, options?)`

Load and validate environment variables.

**Parameters:**
- `meta` - EnvMeta instance from define()
- `options.preprocess` - Custom preprocessing functions
- `options.strict` - Throw on errors (default: true)

**Returns:** `Promise<T>` with validated variables

### `setup(meta, options?)`

Interactive setup for environment variables.

**Parameters:**
- `meta` - EnvMeta instance from define()
- `options.theme` - Color theme function
- `options.secrets` - Secret patterns for masking
- `options.truncate` - Max display length

**Returns:** `Promise<void>`

### `defaults`

Default configuration values:
- `defaults.theme` - Default color (magenta)
- `defaults.secrets` - Default secret patterns
- `defaults.truncate` - Default truncation (40)
- `defaults.path` - Default env path (".env")

## Error Handling

```typescript
import { load, EnvValidationAggregateError } from "e-n-v";

try {
  const config = await load(env);
} catch (error) {
  if (error instanceof EnvValidationAggregateError) {
    console.error(`${error.errors.length} validation errors:`);
    console.error(`Missing: ${error.missingVars.join(", ")}`);
    console.error(`Invalid: ${error.invalidVars.join(", ")}`);
    console.error("\n" + error.message);
  }
}
```

## Why "e-n-v"?

**"Environments, niftily? Very!"**

A playful take on environment variable management that emphasizes:
- **Elegance** - Clean, intuitive API
- **Nifty** - Smart features like aggregate errors and preprocessing
- **Versatile** - Works with any schema library and multiple channels

## License

MIT
