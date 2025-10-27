# Implementation Summary

## Architecture Overview

The envcredible ecosystem provides a modern, type-safe approach to environment variable management with three core functions:

1. **spec()** - Define your environment schema once
2. **parse()** - Load and validate at runtime
3. **prompt()** - Interactive configuration for development

## Package Structure

### User-Facing Packages

#### `e-n-v`

Unified API that combines specification, parsing, and prompting.

**Key exports:**

- `spec()` - Create environment specifications
- `parse()` - Parse and validate environment variables
- `prompt()` - Interactive setup
- `defaults` - Default configuration values

#### `prompt-env`

Interactive CLI for configuring `.env` files.

**Key features:**

- Secret masking with toggle reveal
- Value validation before writing
- Multiple channel support (file, dotenvx)
- Accepts both `vars` and `spec` options

#### `shape-env`

Direct environment variable parsing and validation.

**Key features:**

- Non-mutating (doesn't touch process.env)
- Aggregate error handling
- Preprocessing support
- Type-safe with full TypeScript support

#### `env-var-schemas`

Pre-built schemas for common environment variables.

**Provides:**

- `NODE_ENV`, `PORT`, `DATABASE_URL`, etc.
- Zod v3 and v4 compatible schemas

### Core Packages

#### `@envcredible/specification`

Environment variable specification definition.

**Key exports:**

- `EnvSpec` class
- `spec()` sugar function
- `EnvSpecOptions` interface
- Preprocessing types

#### `@envcredible/schemata`

Schema resolution and conversion.

**Key exports:**

- `resolveSchema()` - Convert any schema to EnvVarSchema
- `resolveSchemas()` - Convert map of schemas
- Converters for Zod v3, v4, Joi

#### `@envcredible/core`

Core types and utilities.

**Key exports:**

- `EnvVarSchema` - Internal schema type
- `schema` / `s` - Native schema builders
- Preprocessor types and resolution
- Processor implementations

#### `@envcredible/channels`

Channel abstraction for reading/writing env vars.

**Key exports:**

- `EnvChannel` interface
- `resolveChannel()` function
- `DefaultEnvChannel` (file-based)
- `DotEnvXChannel` (dotenvx integration)

## Dependencies

\`\`\`text
e-n-v
├─ @envcredible/specification
├─ prompt-env
│ ├─ @envcredible/specification
│ ├─ @envcredible/schemata
│ ├─ @envcredible/channels
│ └─ @envcredible/core
└─ shape-env
├─ @envcredible/specification
├─ @envcredible/schemata
└─ @envcredible/core
\`\`\`

## Design Principles

1. **Functional API** - Simple functions over classes
2. **Type Safety** - Full TypeScript support throughout
3. **Flexibility** - Support multiple schema libraries (Zod, Joi, native)
4. **Non-Mutating** - Never touches process.env directly
5. **Aggregate Errors** - Show all validation errors at once
6. **Preprocessing** - Flexible value normalization

## Usage Example

\`\`\`typescript
// env.spec.ts
import { spec } from "e-n-v";
import { z } from "zod";

export default spec({
schemas: {
NODE_ENV: z.enum(["development", "production", "test"]),
PORT: z.number().min(1024),
DATABASE_URL: z.string().url(),
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
import { prompt } from "e-n-v";

await prompt({ spec, path: ".env" });
\`\`\`
