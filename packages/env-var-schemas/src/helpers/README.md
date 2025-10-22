# Using Zod for Environment Variable Schema Validation

This approach leverages Zod's powerful validation system while maintaining the native EnvVarSchema interface. By using Zod inline with `processWithZodSchema`, you get the best of both worlds: Zod's mature validation ecosystem and the envcredible schema system's consistent interface.

## Architecture

**How it works:**

1. Define validation using Zod schemas inline
2. Convert to process functions using `processWithZodSchema`
3. Return native EnvVarSchema objects with input override support
4. Users get consistent EnvVarSchema interface, not directly modifiable Zod schemas

**Benefits:**

- **Zod's validation power**: Full access to Zod's rich validation methods
- **Consistent interface**: All schemas return the same EnvVarSchema type
- **Input overrides**: Users can still customize schemas via the input parameter
- **Type safety**: Full TypeScript support throughout
- **Battle-tested**: Leverages Zod's proven validation logic

## Basic Pattern

```typescript
import { StringEnvVarSchema, NumberEnvVarSchema } from "@envcredible/core";
import { processWithZodSchema } from "@envcredible/converters";
import { z } from "zod";

export const apiKey = (input = {}) =>
  new StringEnvVarSchema({
    description: "API key for authentication",
    process: processWithZodSchema<string>(
      z.string().min(8, { message: "API key must be at least 8 characters" }),
      "string"
    ),
    ...input,
  });
```

## Common Validation Patterns

### String Validation

```typescript
// Simple length validation
z.string().min(8, { message: "Too short" })
z.string().max(128, { message: "Too long" })
z.string().length(40, { message: "Must be exactly 40 characters" })

// Pattern matching
z.string().regex(/^sk-[A-Za-z0-9]+$/, { message: "Invalid format" })

// URL validation
z.string().url({ message: "Must be a valid URL" })

// URL with protocol requirement
z.string()
  .url({ message: "Must be a valid URL" })
  .refine(url => url.startsWith("https://"), { message: "Must use HTTPS" })

// Required (non-empty) string
z.string().min(1, { message: "Required field" })

// Complex validation with multiple rules
z.string()
  .min(32, { message: "Too short" })
  .regex(/^[A-Za-z0-9_-]+$/, { message: "Invalid characters" })
  .refine(val => !val.includes('test'), { message: "Cannot contain 'test'" })
```

### Number Validation

```typescript
// Basic number with coercion (string to number)
z.coerce.number()

// Integer validation
z.coerce.number().int({ message: "Must be an integer" })

// Range validation
z.coerce.number()
  .min(1, { message: "Must be at least 1" })
  .max(100, { message: "Must be at most 100" })

// Port validation
z.coerce.number()
  .int({ message: "Must be an integer" })
  .min(1024, { message: "Must be >= 1024" })
  .max(65535, { message: "Must be <= 65535" })
```

## Real-World Examples

### API Configuration

```typescript
export const apiKey = (input = {}) =>
  new StringEnvVarSchema({
    description: "API key for authentication",
    process: processWithZodSchema<string>(
      z.string().min(8, { message: "API key must be at least 8 characters" }),
      "string"
    ),
    secret: true, // Mark as secret
    ...input,
  });

export const apiBaseUrl = (input = {}) =>
  new StringEnvVarSchema({
    description: "Base URL for API requests",
    process: processWithZodSchema<string>(
      z.string()
        .url({ message: "Must be a valid URL" })
        .refine(
          url => /^https?:\/\//.test(url),
          { message: "Must start with http:// or https://" }
        ),
      "string"
    ),
    ...input,
  });

export const apiTimeout = (input = {}) =>
  new NumberEnvVarSchema({
    description: "API request timeout in seconds",
    default: 30,
    process: processWithZodSchema<number>(
      z.coerce.number()
        .int({ message: "Must be an integer" })
        .min(1, { message: "Must be at least 1 second" })
        .max(300, { message: "Must be at most 300 seconds" }),
      "number"
    ),
    ...input,
  });
```

### OpenAI Configuration

```typescript
export const openaiApiKey = (input = {}) =>
  new StringEnvVarSchema({
    description: "OpenAI API key",
    process: processWithZodSchema<string>(
      z.string()
        .min(40, { message: "Must be at least 40 characters" })
        .regex(/^sk-[A-Za-z0-9]+$/, { message: "Must start with 'sk-'" }),
      "string"
    ),
    secret: true,
    ...input,
  });

export const openaiModel = (input = {}) =>
  new StringEnvVarSchema({
    description: "OpenAI model to use",
    process: processWithZodSchema<string>(
      z.string().min(1, { message: "Model cannot be empty" }),
      "string"
    ),
    default: "gpt-4",
    ...input,
  });
```

### Database Configuration

```typescript
export const databaseUrl = (input = {}) =>
  new StringEnvVarSchema({
    description: "Database connection URL",
    process: processWithZodSchema<string>(
      z.string()
        .url({ message: "Must be a valid URL" })
        .refine(
          url => /^postgres:\/\//.test(url),
          { message: "Must be a PostgreSQL URL" }
        ),
      "string"
    ),
    secret: true,
    ...input,
  });

export const databasePoolSize = (input = {}) =>
  new NumberEnvVarSchema({
    description: "Database connection pool size",
    default: 10,
    process: processWithZodSchema<number>(
      z.coerce.number()
        .int({ message: "Must be an integer" })
        .min(1, { message: "Must be at least 1" })
        .max(100, { message: "Must be at most 100" }),
      "number"
    ),
    ...input,
  });
```

## Advanced Patterns

### Conditional Validation

```typescript
export const redisConfig = (input = {}) =>
  new StringEnvVarSchema({
    description: "Redis configuration",
    process: processWithZodSchema<string>(
      z.string().refine(
        (val) => {
          // Could be a URL or host:port
          try {
            new URL(val);
            return true; // Valid URL
          } catch {
            return /^[^:]+:\d+$/.test(val); // Check host:port format
          }
        },
        { message: "Must be a valid URL or host:port format" }
      ),
      "string"
    ),
    ...input,
  });
```

### Transform and Validate

```typescript
export const corsOrigins = (input = {}) =>
  new StringEnvVarSchema({
    description: "CORS allowed origins (comma-separated)",
    process: processWithZodSchema<string>(
      z.string()
        .transform(val => val.split(',').map(s => s.trim()))
        .refine(
          origins => origins.every(origin => origin === '*' || /^https?:\/\//.test(origin)),
          { message: "Each origin must be '*' or a valid URL" }
        )
        .transform(origins => origins.join(',')), // Convert back to string
      "string"
    ),
    ...input,
  });
```

## Migration from v4 Zod Schemas

**v4 approach** (returns Zod schemas):

```typescript
export const apiKey = () =>
  z.string()
    .describe("API key")
    .min(8, { message: "Too short" });
```

**envcredible approach** (returns EnvVarSchema):

```typescript
export const apiKey = (input = {}) =>
  new StringEnvVarSchema({
    description: "API key",
    process: processWithZodSchema<string>(
      z.string().min(8, { message: "Too short" }),
      "string"
    ),
    ...input,
  });
```

The validation logic is identical, but the interface is consistent and supports input overrides.

## Why This Approach?

1. **Proven validation**: Zod is battle-tested with excellent error messages
2. **Rich ecosystem**: Full access to Zod's validation methods
3. **Consistent interface**: All functions return the same EnvVarSchema type
4. **Customizable**: Input override pattern allows user customization
5. **Type safe**: Full TypeScript support throughout
6. **Future-proof**: Easy to extend with new Zod features
