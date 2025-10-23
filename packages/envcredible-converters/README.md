# @envcredible/converters

This package provides converters that transform external schema libraries (like Zod and Joi) into envcredible's internal `TypedEnvVarSchema` format.

## Quick Start

```typescript
import { resolveSchema } from "@envcredible/converters";
import { z } from "zod";
import Joi from "joi";

// Convert any supported schema to envcredible format
const zodSchema = resolveSchema(z.string().optional());
const joiSchema = resolveSchema(Joi.string().optional());

console.log(zodSchema.type);     // "string"
console.log(zodSchema.required); // false
```

## Main API

### `resolveSchema(schema: unknown): TypedEnvVarSchema`

The primary entry point for converting schemas. Automatically detects the schema type and uses the appropriate converter.

```typescript
import { resolveSchema } from "@envcredible/converters";
import { z } from "zod";
import Joi from "joi";

// Works with Zod v3 and v4
const stringSchema = resolveSchema(z.string());
const numberSchema = resolveSchema(z.number().optional());
const booleanSchema = resolveSchema(z.boolean().default(false));
const enumSchema = resolveSchema(z.enum(["dev", "prod", "test"]));

// Works with Joi
const joiStringSchema = resolveSchema(Joi.string());
const joiNumberSchema = resolveSchema(Joi.number().optional());
const joiBooleanSchema = resolveSchema(Joi.boolean().default(false));
const joiEnumSchema = resolveSchema(Joi.string().valid("dev", "prod", "test"));
```

## Built-in Converters

The package includes converters for:

- **Zod v3**: Handles classic Zod schemas
- **Zod v4**: Handles newer Zod schemas with improved performance
- **Joi**: Handles Joi validation schemas

## Supported Schema Types

### Zod (v3 & v4)

- `z.string()` → `StringEnvVarSchema`
- `z.number()` → `NumberEnvVarSchema`
- `z.boolean()` → `BooleanEnvVarSchema`
- `z.enum([...])` → `EnumEnvVarSchema`
- `z.stringbool()` (v4) → `BooleanEnvVarSchema`

### Joi

- `Joi.string()` → `StringEnvVarSchema`
- `Joi.number()` → `NumberEnvVarSchema`
- `Joi.boolean()` → `BooleanEnvVarSchema`
- `Joi.string().valid(...)` → `EnumEnvVarSchema`

### Modifiers

All schema modifier combinations are supported:

#### Zod Modifiers

- `.optional()` → `required: false`
- `.default(value)` → extracts default value
- `.nullable()` → handled appropriately
- `.describe(text)` → extracts description
- Complex nesting of modifiers

#### Joi Modifiers

- `.optional()` → `required: false`
- `.default(value)` → extracts default value
- `.description(text)` → extracts description
- `.valid(...)` → creates enum schema

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
