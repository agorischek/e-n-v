# @envcredible/converters

This package provides converters that transform external schema libraries (like Zod) into envcredible's internal `TypedEnvVarSchema` format.

## Quick Start

```typescript
import { resolveSchema } from "@envcredible/converters";
import { z } from "zod";

// Convert any supported schema to envcredible format
const envSchema = resolveSchema(z.string().optional());

console.log(envSchema.type);     // "string"
console.log(envSchema.required); // false
```

## Main API

### `resolveSchema(schema: unknown): TypedEnvVarSchema`

The primary entry point for converting schemas. Automatically detects the schema type and uses the appropriate converter.

```typescript
import { resolveSchema } from "@envcredible/converters";
import { z } from "zod";

// Works with Zod v3 and v4
const stringSchema = resolveSchema(z.string());
const numberSchema = resolveSchema(z.number().optional());
const booleanSchema = resolveSchema(z.boolean().default(false));
const enumSchema = resolveSchema(z.enum(["dev", "prod", "test"]));
```

## Built-in Converters

The package includes converters for:

- **Zod v3**: Handles classic Zod schemas
- **Zod v4**: Handles newer Zod schemas with improved performance

## Supported Schema Types

### Zod (v3 & v4)

- `z.string()` → `StringEnvVarSchema`
- `z.number()` → `NumberEnvVarSchema`
- `z.boolean()` → `BooleanEnvVarSchema`
- `z.enum([...])` → `EnumEnvVarSchema`
- `z.stringbool()` (v4) → `BooleanEnvVarSchema`

### Modifiers

All Zod modifier combinations are supported:

- `.optional()` → `required: false`
- `.default(value)` → extracts default value
- `.nullable()` → handled appropriately
- `.describe(text)` → extracts description
- Complex nesting of modifiers

## Type Checking

To check if a value is an environment variable schema, use `instanceof` with the base class:

```typescript
import { EnvVarSchema } from "@envcredible/core";

// Type guard using instanceof
if (value instanceof EnvVarSchema) {
  // value is definitely an EnvVarSchema
  console.log(value.type, value.required);
}
```
