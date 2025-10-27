# e·n·v Models

Environment variable model definition for e·n·v.

## Overview

`@e-n-v/models` provides a clean way to define your environment variable schemas and preprocessing configuration in one place. It's the foundation for type-safe environment variable management across your application.

## Installation

```bash
npm install @e-n-v/models
# or
bun add @e-n-v/models
```

## Quick Start

```typescript
// env.model.ts
import { define } from "@e-n-v/models";
import { z } from "zod";

export default define({
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

### `define(options: EnvModelOptions): EnvModel`

Create an environment variable model.

#### Options

- **`schemas`** (required): `Record<string, SupportedSchema>`  
  Map of environment variable names to their schema definitions. Supports:
  - Zod schemas (v3 and v4)
  - Joi schemas
  - Native e·n·v schemas

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

### `EnvModel` Class

The model container with resolved schemas and preprocessor configuration.

#### Properties

- **`schemas`**: `Record<string, EnvVarSchema>`  
  Resolved environment variable schemas (converted to internal format)

- **`preprocess`**: `Preprocessors`  
  Resolved preprocessor configuration

## Usage Examples

### Basic Model

```typescript
import { define } from "@e-n-v/models";
import { z } from "zod";

export default define({
  schemas: {
    PORT: z.number(),
    HOST: z.string(),
  },
  preprocess: true,
});
```

### With Preprocessing Disabled

```typescript
import { define } from "@e-n-v/models";
import { z } from "zod";

// No value normalization - raw strings only
export default define({
  schemas: {
    STRICT_VALUE: z.string(),
  },
  preprocess: false,
});
```

### Custom Preprocessors

```typescript
import { define } from "@e-n-v/models";
import { z } from "zod";

export default define({
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

### Using with @e-n-v/env

```typescript
// env.model.ts
import { define } from "@e-n-v/models";
import { NODE_ENV, OPENAI_API_KEY } from "@e-n-v/schemas";

export default define({
  schemas: { NODE_ENV, OPENAI_API_KEY },
  preprocess: false,
});
```

```typescript
// env.ts
import spec from "./env.model.js";
import { parse } from "@e-n-v/parse";

export const env = parse({ source: process.env, spec });
```

```typescript
// env.setup.ts
import spec from "./env.model.js";
import { prompt, defaults } from "@e-n-v/prompt";

await prompt({
  spec,
  secrets: [...defaults.SECRET_PATTERNS, "key"],
  path: ".env",
});
```

### Reusable Models

```typescript
// specs/database.model.ts
import { define } from "@e-n-v/models";
import { z } from "zod";

export const modelSpec = define({
  schemas: {
    DATABASE_URL: z.string().url(),
    DATABASE_POOL_SIZE: z.number().int().positive(),
    DATABASE_TIMEOUT: z.number().int().positive(),
  },
  preprocess: true,
});
```

```typescript
// specs/api.model.ts
import { define } from "@e-n-v/models";
import { z } from "zod";

export const modelSpec = define({
  schemas: {
    API_PORT: z.number().int().positive(),
    API_HOST: z.string(),
    API_KEY: z.string().min(32),
  },
  preprocess: true,
});
```

```typescript
// env.model.ts
import { define } from "@e-n-v/models";
import { databaseModel } from "./specs/database.model";
import { apiModel } from "./specs/api.model";

// Combine multiple models
export default define({
  schemas: {
    ...databaseModel.schemas,
    ...apiModel.schemas,
  },
  preprocess: true,
});
```

## Type Safety

The specification is fully typed, ensuring type safety throughout your application:

```typescript
```typescript
import { define } from "@e-n-v/models";
import { z } from "zod";

const modelSpec = define({
  schemas: {
    PORT: z.number(),
    HOST: z.string(),
  },
  preprocess: true,
});

// TypeScript knows the shape of schemas
type SchemaKeys = keyof typeof myModel.schemas; // "PORT" | "HOST"
```

## Related Packages

- **[@e-n-v/converters](../converters)**: Schema resolution and conversion
- **[@e-n-v/core](../core)**: Core types and utilities
- **[@e-n-v/env](../env)**: High-level environment variable management

## License

MIT
