# @envcredible/specification

Environment variable specification definition for envcredible.

## Overview

`@envcredible/specification` provides a clean way to define your environment variable schemas and preprocessing configuration in one place. It's the foundation for type-safe environment variable management across your application.

## Installation

```bash
npm install @envcredible/specification
# or
bun add @envcredible/specification
```

## Quick Start

```typescript
// env.spec.ts
import { spec } from "@envcredible/specification";
import { z } from "zod";

export default spec({
  schemas: {
    NODE_ENV: z.enum(["development", "production", "test"]),
    PORT: z.number().int().positive(),
    DATABASE_URL: z.string().url(),
    API_KEY: z.string().min(1),
    DEBUG: z.boolean().optional(),
  },
  preprocess: true,
});
```

## API

### `spec(options: EnvSpecOptions): EnvSpec`

Create an environment variable specification.

#### Options

- **`schemas`** (required): `Record<string, SupportedSchema>`  
  Map of environment variable names to their schema definitions. Supports:
  - Zod schemas (v3 and v4)
  - Joi schemas
  - Native envcredible schemas

- **`preprocess`** (optional): `true | false | Partial<Preprocessors>`
  - `true` (default): Use default preprocessors for all types
  - `false`: Disable all preprocessing
  - Partial object: Customize specific type preprocessors

#### Preprocessors

Preprocessors normalize values before validation:

- **`string`**: Pass-through (no transformation)
- **`number`**: Strips commas and whitespace (`"1,000"` → `"1000"`)
- **`bool`**: Normalizes common phrases:
  - `"on"`, `"enabled"`, `"active"`, `"yes"` → `"true"`
  - `"off"`, `"disabled"`, `"inactive"`, `"no"` → `"false"`
- **`enum`**: Pass-through (no transformation)

### `EnvSpec` Class

The specification container with resolved schemas and preprocessor configuration.

#### Properties

- **`schemas`**: `Record<string, EnvVarSchema>`  
  Resolved environment variable schemas (converted to internal format)

- **`preprocess`**: `Preprocessors`  
  Resolved preprocessor configuration

## Usage Examples

### Basic Specification

```typescript
import { spec } from "@envcredible/specification";
import { z } from "zod";

export default spec({
  schemas: {
    PORT: z.number(),
    HOST: z.string(),
  },
  preprocess: true,
});
```

### With Preprocessing Disabled

```typescript
import { spec } from "@envcredible/specification";
import { z } from "zod";

// No value normalization - raw strings only
export default spec({
  schemas: {
    STRICT_VALUE: z.string(),
  },
  preprocess: false,
});
```

### Custom Preprocessors

```typescript
import { spec } from "@envcredible/specification";
import { z } from "zod";

export default spec({
  schemas: {
    PORT: z.number(),
    DEBUG: z.boolean(),
  },
  preprocess: {
    // Keep default number preprocessing
    number: undefined,
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

### Using with e-n-v

```typescript
// env.spec.ts
import { spec } from "e-n-v";
import { NODE_ENV, OPENAI_API_KEY } from "e-n-v/schemas";

export default spec({
  schemas: { NODE_ENV, OPENAI_API_KEY },
  preprocess: false,
});
```

```typescript
// env.ts
import spec from "./env.spec.js";
import { parse } from "e-n-v";

export const { NODE_ENV, OPENAI_API_KEY } = parse(process.env, spec, {});
```

```typescript
// env.setup.ts
import spec from "./env.spec.js";
import { prompt, defaults } from "e-n-v";
import dotenvx from "@dotenvx/dotenvx";

await prompt(spec, {
  secrets: [...defaults.SECRET_PATTERNS, "key"],
  channel: dotenvx,
});
```

### Reusable Specifications

```typescript
// specs/database.spec.ts
import { spec } from "@envcredible/specification";
import { z } from "zod";

export const databaseSpec = spec({
  schemas: {
    DATABASE_URL: z.string().url(),
    DATABASE_POOL_SIZE: z.number().int().positive(),
    DATABASE_TIMEOUT: z.number().int().positive(),
  },
  preprocess: true,
});
```

```typescript
// specs/api.spec.ts
import { spec } from "@envcredible/specification";
import { z } from "zod";

export const apiSpec = spec({
  schemas: {
    API_PORT: z.number().int().positive(),
    API_HOST: z.string(),
    API_KEY: z.string().min(32),
  },
  preprocess: true,
});
```

```typescript
// env.spec.ts
import { spec } from "@envcredible/specification";
import { databaseSpec } from "./specs/database.spec";
import { apiSpec } from "./specs/api.spec";

// Combine multiple specifications
export default spec({
  schemas: {
    ...databaseSpec.schemas,
    ...apiSpec.schemas,
  },
  preprocess: true,
});
```

## Type Safety

The specification is fully typed, ensuring type safety throughout your application:

```typescript
import { spec } from "@envcredible/specification";
import { z } from "zod";

const mySpec = spec({
  schemas: {
    PORT: z.number(),
    HOST: z.string(),
  },
  preprocess: true,
});

// TypeScript knows the shape of schemas
type SchemaKeys = keyof typeof mySpec.schemas; // "PORT" | "HOST"
```

## Related Packages

- **[@envcredible/schemata](../envcredible-schemata)**: Schema resolution and conversion
- **[@envcredible/core](../envcredible-core)**: Core types and utilities
- **[e-n-v](../e-n-v)**: High-level environment variable management

## License

MIT
