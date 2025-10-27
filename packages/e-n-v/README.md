<!-- markdownlint-disable-next-line -->
<img src="./assets/env-logo2.png" alt="e-n-v Logo" height="75"/>

# e-n-v

**"Environments, niftily? Very!"**

A unified, elegant API for environment variable management with type-safe schemas, interactive setup, and validation.

## Philosophy

`e-n-v` provides three core functions for working with environment variables:

1. **spec()** - Define your environment schema once
2. **parse()** - Load and validate at runtime
3. **prompt()** - Interactive configuration for development

## Installation

```bash
bun add e-n-v zod
```

## Quick Start

### 1. Define Your Specification (env.spec.ts)

Create a reusable environment specification:

```typescript
import { spec } from "e-n-v";
import { z } from "zod";

export default spec({
  schemas: {
    NODE_ENV: z.enum(["development", "production", "test"]),
    DATABASE_URL: z.string().url(),
    PORT: z.number().min(1024).max(65535),
    API_KEY: z.string().min(32),
    DEBUG: z.boolean().optional(),
  },
  preprocess: true,
});
```

### 2. Parse at Runtime (app.ts)

Load and validate your environment variables:

```typescript
import spec from "./env.spec.js";
import { parse } from "e-n-v";

// Parse and validate - fully type-safe!
export const env = parse({
  source: process.env as Record<string, string>,
  spec,
});

// Use validated environment
console.log(`Server on port ${env.PORT}`);
console.log(`Environment: ${env.NODE_ENV}`);
```

### 3. Interactive Setup (env.setup.ts)

Create an interactive setup script for development:

```typescript
import spec from "./env.spec.js";
import { prompt, defaults } from "e-n-v";

await prompt({
  spec,
  secrets: [...defaults.SECRET_PATTERNS, "API_KEY"],
  path: ".env",
});
```

Run it to configure your environment:

```bash
bun run env.setup.ts
```

## Advanced Usage

### Using Predefined Schemas

Import commonly used schemas from `e-n-v/schemas`:

```typescript
import { spec } from "e-n-v";
import { NODE_ENV, PORT, DATABASE_URL } from "env-var-schemas";

export default spec({
  schemas: {
    NODE_ENV,
    PORT,
    DATABASE_URL,
  },
  preprocess: true,
});
```

### Custom Preprocessing

Control how values are normalized before validation:

```typescript
import { spec } from "e-n-v";
import { z } from "zod";

export default spec({
  schemas: {
    PORT: z.number(),
    DEBUG: z.boolean(),
  },
  preprocess: {
    // Custom number preprocessing
    number: (value) => value.replace(/,/g, "").trim(),
    // Custom boolean preprocessing
    bool: (value) => {
      if (value === "1") return "true";
      if (value === "0") return "false";
      return value;
    },
    // Disable string preprocessing
    string: null,
  },
});
```

### Disable All Preprocessing

```typescript
export default spec({
  schemas: {
    /* ... */
  },
  preprocess: false, // No value normalization
});
```

### Non-Strict Mode

Allow missing/invalid variables without throwing:

```typescript
const env = parse({
  source: process.env as Record<string, string>,
  spec,
  strict: false, // Returns undefined for missing/invalid vars
});
```

### Using Native Schemas

```typescript
import { spec, schema } from "e-n-v";

export default spec({
  schemas: {
    PORT: schema.number({ default: 3000 }),
    DEBUG: schema.boolean({ default: false }),
    API_URL: schema.string(),
    LOG_LEVEL: schema.enum({
      values: ["debug", "info", "warn", "error"] as const,
    }),
  },
  preprocess: true,
});
```

## API Reference

### `spec(options: EnvSpecOptions): EnvSpec`

Create an environment variable specification.

**Options:**

- `schemas` (required): `Record<string, SupportedSchema>` - Map of variable names to schemas
- `preprocess` (optional): `true | false | Partial<Preprocessors>` - Preprocessing configuration
  - `true` (default): Use default preprocessors
  - `false`: Disable all preprocessing
  - Partial object: Customize specific preprocessors

**Returns:** `EnvSpec` instance with:

- `schemas`: Resolved environment variable schemas
- `preprocess`: Resolved preprocessor configuration

### `parse<T>(options: DirectEnvOptions): T`

Load and validate environment variables.

**Options:**

- `source` (required): `Record<string, string>` - Source object (e.g., process.env)
- `spec` or `vars` (required): Specification or schemas
- `preprocess` (optional): Override preprocessing configuration
- `strict` (optional): Throw on errors (default: true)

**Returns:** Validated environment variables object

**Throws:** `EnvValidationAggregateError` in strict mode

### `prompt(options: PromptEnvOptions): Promise<void>`

Interactive setup for environment variables.

**Options:**

- `spec` or `vars` (required): Specification or schemas
- `path` (optional): Path to .env file (default: ".env")
- `root` (optional): Root directory for resolving paths
- `secrets` (optional): Patterns for masking secret values
- `truncate` (optional): Max display length (default: 40)
- `theme` (optional): Color theme function
- `channel` (optional): Channel for reading/writing vars

**Returns:** Promise that resolves when setup is complete

### `defaults`

Default configuration values:

- `defaults.theme` - Default color theme (magenta)
- `defaults.SECRET_PATTERNS` - Default secret patterns
- `defaults.truncate` - Default truncation length (40)
- `defaults.path` - Default env file path (".env")

## Preprocessors

Default preprocessors normalize values before validation:

- **`string`**: Pass-through (no transformation)
- **`number`**: Strips commas and whitespace (`"1,000"` → `"1000"`)
- **`bool`**: Normalizes common phrases:
  - `"on"`, `"enabled"`, `"active"`, `"yes"` → `"true"`
  - `"off"`, `"disabled"`, `"inactive"`, `"no"` → `"false"`
- **`enum`**: Pass-through (no transformation)

## Error Handling

```typescript
import { parse, EnvValidationAggregateError } from "e-n-v";
import spec from "./env.spec.js";

try {
  const env = parse({ source: process.env as Record<string, string>, spec });
} catch (error) {
  if (error instanceof EnvValidationAggregateError) {
    console.error(`${error.errors.length} validation errors:`);
    console.error(`Missing: ${error.missingVars.join(", ")}`);
    console.error(`Invalid: ${error.invalidVars.join(", ")}`);
    console.error("\n" + error.message);
  }
}
```

## Schema Support

Works with multiple schema libraries:

- **Zod** (v3 and v4)
- **Joi**
- **Native envcredible schemas**

```typescript
import { spec } from "e-n-v";
import { z } from "zod";
import Joi from "joi";
import { schema } from "e-n-v";

export default spec({
  schemas: {
    // Mix and match!
    PORT: z.number(),
    API_KEY: Joi.string().required(),
    DEBUG: schema.boolean(),
  },
  preprocess: true,
});
```

## Why "e-n-v"?

"Environments, niftily? Very!"

A playful take on environment variable management that emphasizes:

- **Elegance** - Clean, intuitive API
- **Nifty** - Smart features like preprocessing and aggregate errors
- **Versatile** - Works with any schema library

## Related Packages

- **[@envcredible/specification](../envcredible-specification)**: Core specification functionality
- **[prompt-env](../prompt-env)**: Interactive environment variable setup
- **[shape-env](../shape-env)**: Environment variable parsing and validation

## License

MIT
