<!-- markdownlint-disable-next-line -->
<img src="./assets/direct-env-logo2.png" alt="Ask Env Logo" height="75"/>

# e·n·v Parse

Direct environment variable loading and validation with runtime type safety.

## Features

- 🔒 **Non-mutating**: Reads env vars without touching `process.env`
- ✅ **Validation**: Parse and validate using schemas (Zod, Joi, or native)
- 🔌 **Channel-based**: Load from files, dotenvx, or custom sources
- 🎯 **Type-safe**: Full TypeScript support with inferred types
- 🔧 **Preprocessing**: Normalize values before validation

## Installation

```bash
npm install @e-n-v/parse
# or
bun add @e-n-v/parse
```

## Usage

### Basic Example

```typescript
import { parse } from "@e-n-v/parse";
import { schema } from "@e-n-v/core";

const env = parse(process.env as Record<string, string>, {
  schemas: {
    PORT: schema.number({ default: 3000 }),
    DATABASE_URL: schema.string(),
    DEBUG: schema.boolean({ default: false }),
  },
});

console.log(env.PORT); // number
console.log(env.DATABASE_URL); // string
console.log(env.DEBUG); // boolean
```

### Using EnvModel

```typescript
import { define } from "@e-n-v/models";
import { parse } from "@e-n-v/parse";
import { z } from "zod";

// Create reusable model
const envModel = define({
  schemas: {
    API_KEY: z.string(),
    MAX_CONNECTIONS: z.number(),
  },
  preprocess: true,
});

// Overload 1: Use the model for parsing
const env1 = parse(process.env as Record<string, string>, envModel);

// Overload 2: Use options for parsing  
const env2 = parse(process.env as Record<string, string>, {
  schemas: {
    API_KEY: z.string(),
    MAX_CONNECTIONS: z.number(),
  },
  preprocess: true,
});
```

### With Zod Schemas

```typescript
import { parse } from "@e-n-v/parse";
import { z } from "zod";

const env = parse(process.env as Record<string, string>, {
  schemas: {
    PORT: z.number().min(1024).max(65535),
    NODE_ENV: z.enum(["development", "production", "test"]),
    API_URL: z.string().url(),
  },
});
```

### With Custom Preprocessing

```typescript
import { parse } from "@e-n-v/parse";
import { schema } from "@e-n-v/core";

const env = parse(process.env as Record<string, string>, {
  
  schemas: {
    PERCENTAGE: schema.number(),
    ENABLED: schema.boolean(),
  },
  preprocess: {
    number: (value) => value.replace(/%$/, ""), // Strip % suffix
    bool: (value) => (value === "on" ? "true" : value),
  },
});
```

### Using Different Channels

For loading from files or other sources, use the higher-level `@e-n-v/env` package which provides channel support:

```typescript
import { parse, prompt } from "@e-n-v/env";
import modelSpec from "./env.spec.js";

// Parse from process.env
const env = parse(process.env as Record<string, string>, modelSpec);

// Or use prompt for interactive setup with channels
await prompt(modelSpec, { path: ".env" });
```

## API

### `parse<T>(source: Record<string, string>, model: EnvModel<T>): T`

### `parse<T>(source: Record<string, string>, options: ParseEnvOptions<T>): T`

Load and validate environment variables.

#### Overload 1: Using model instance

**Parameters:**

- `source`: `Record<string, string>` - Source object containing environment variables
- `model`: `EnvModel<T>` - Environment model instance with schemas and preprocessing config

**Returns:** `T` - Validated environment variables

#### Overload 2: Using options object

**Parameters:**

- `source`: `Record<string, string>` - Source object containing environment variables  
- `options`: `ParseEnvOptions<T>` - Configuration object
  - `schemas`: Variable schemas
  - `preprocess`: Preprocessing configuration (optional)

**Returns:** `T` - Validated environment variables

### `define(options: EnvModelOptions): EnvModel`

Create an environment variable specification.

**Parameters:**

- `options`: `EnvModelOptions`
  - `schemas`: `Record<string, SupportedSchema>` - Variable schemas
  - `preprocess`: `true | false | Partial<Preprocessors>` - Preprocessing config

**Returns:** `EnvModel` instance with resolved schemas and preprocessor configuration

## Error Handling

### Aggregate Errors

By default, `@e-n-v/parse` validates **all** environment variables and collects errors before throwing. This gives you a complete picture of what's wrong instead of failing on the first error.

```typescript
import { parse, EnvValidationAggregateError } from "@e-n-v/parse";
import { schema } from "@e-n-v/core";

try {
  const env = parse(process.env as Record<string, string>, {
    
    schemas: {
      PORT: schema.number(),
      DATABASE_URL: schema.string(),
      DEBUG: schema.boolean(),
      MAX_RETRIES: schema.number(),
    },
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
import { MissingEnvVarError, ValidationError } from "@e-n-v/parse";

if (error instanceof EnvValidationAggregateError) {
  error.errors.forEach((err) => {
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
const env = parse(process.env as Record<string, string>, {
  source: {
    /* ... */
  },
  schemas: { PORT: schema.number() },
  strict: false,
});

// env.PORT will be undefined if missing or invalid
```

## Related Packages

- **[@e-n-v/core](../core)**: Core types and schema definitions
- **[@e-n-v/models](../models)**: Environment variable models
- **[@e-n-v/converters](../converters)**: Schema resolution and conversion
- **[@e-n-v/env](../env)**: Higher-level API including channels and interactive setup

## License

MIT
