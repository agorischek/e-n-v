# Envalid Converter

The Envalid converter allows you to use existing [Envalid](https://github.com/af/envalid) validators with the envcredible ecosystem. This provides seamless migration from Envalid to envcredible while preserving your existing validation logic.

## Features

- ✅ **Full Envalid compatibility**: Supports all standard Envalid validators (`str`, `num`, `bool`, `email`, `url`, `port`, `host`, `json`)
- ✅ **Custom validator support**: Works with validators created using `makeValidator()`, `makeExactValidator()`, and `makeStructuredValidator()`
- ✅ **Default value handling**: Supports both `default` and `devDefault` properties
- ✅ **Environment-aware defaults**: Automatically prefers `devDefault` in non-production environments
- ✅ **Choice-based enums**: Automatically converts validators with `choices` to enum schemas
- ✅ **Description preservation**: Maintains descriptions from the `desc` property
- ✅ **Type safety**: Full TypeScript support with proper type inference

## Usage

```typescript
import { resolveSchema } from "@envcredible/converters";
import { str, num, bool, email } from "envalid";

// Convert individual Envalid validators
const apiKeySchema = resolveSchema(str({ desc: "API key for external service" }));
const portSchema = resolveSchema(num({ default: 3000, desc: "Server port" }));
const debugSchema = resolveSchema(bool({ default: false }));
const adminEmailSchema = resolveSchema(email({ default: "admin@example.com" }));

// Use with existing Envalid validation objects
const envValidators = {
  API_KEY: str(),
  PORT: num({ default: 3000 }),
  DEBUG: bool({ default: false }),
  NODE_ENV: str({ 
    choices: ["development", "test", "production"],
    default: "development"
  }),
  ADMIN_EMAIL: email({ default: "admin@example.com" }),
};

// Convert all validators
const envSchemas = Object.fromEntries(
  Object.entries(envValidators).map(([key, validator]) => [
    key,
    resolveSchema(validator)
  ])
);
```

## Supported Envalid Validators

### Basic Types

| Envalid Validator | Envcredible Type | Description |
|-------------------|------------------|-------------|
| `str()` | `string` | String validation |
| `num()` | `number` | Number validation with coercion |
| `bool()` | `boolean` | Boolean validation with flexible parsing |
| `email()` | `string` | Email validation (treated as specialized string) |
| `url()` | `string` | URL validation (treated as specialized string) |
| `port()` | `number` | Port number validation (treated as specialized number) |
| `host()` | `string` | Host validation (treated as specialized string) |
| `json()` | `string` | JSON validation (treated as string, parsed by Envalid) |

### Special Features

#### Choices → Enums

Validators with `choices` are automatically converted to enum schemas:

```typescript
const envValidator = str({ 
  choices: ["development", "test", "production"],
  default: "development"
});
const schema = resolveSchema(envValidator);
// schema.type === "enum"
// schema.values === ["development", "test", "production"]
```

#### DevDefault Support

The converter respects Envalid's `devDefault` behavior:

```typescript
const dbUrlValidator = str({
  default: "postgres://prod-server/db",
  devDefault: "postgres://localhost:5432/db_dev"
});

// In development/test environments, uses devDefault
// In production, uses default
const schema = resolveSchema(dbUrlValidator);
```

#### Custom Validators

Works with custom validators created using Envalid's maker functions:

```typescript
import { makeValidator } from "envalid";

const uppercaseStr = makeValidator((input: string) => {
  if (typeof input !== "string") throw new Error("Not a string");
  return input.toUpperCase();
});

const schema = resolveSchema(uppercaseStr());
// Works seamlessly with envcredible
```

## Migration from Envalid

### Before (Pure Envalid)

```typescript
import { cleanEnv, str, num, bool, email } from "envalid";

const env = cleanEnv(process.env, {
  API_KEY: str(),
  PORT: num({ default: 3000 }),
  DEBUG: bool({ default: false }),
  ADMIN_EMAIL: email({ default: "admin@example.com" }),
});
```

### After (With Envcredible)

```typescript
import { resolveSchema } from "@envcredible/converters";
import { str, num, bool, email } from "envalid";
// ... import your envcredible processing functions

const schemas = {
  API_KEY: resolveSchema(str()),
  PORT: resolveSchema(num({ default: 3000 })),
  DEBUG: resolveSchema(bool({ default: false })),
  ADMIN_EMAIL: resolveSchema(email({ default: "admin@example.com" })),
};

// Use with your envcredible processing pipeline
```

## Type Conversion Details

The converter uses intelligent type detection by testing the validator with sample inputs:

1. **Boolean Detection**: Tests with `["true", "false", "1", "0", "yes", "no"]`
2. **Number Detection**: Tests with `["42", "3.14", "0"]`
3. **Enum Detection**: Checks for presence of `choices` property
4. **String Fallback**: Defaults to string for any unrecognized patterns

## Error Handling

Validation errors from Envalid are properly wrapped and propagated:

```typescript
const numValidator = num();
const schema = resolveSchema(numValidator);

try {
  schema.process("not-a-number");
} catch (error) {
  // Error: "Envalid validation failed: Invalid number input: \"not-a-number\""
}
```

## Limitations

1. **JSON Validators**: `json()` validators are treated as strings in envcredible. The JSON parsing happens within Envalid's validator, so the output is still properly parsed.

2. **RequiredWhen**: The `requiredWhen` function property is not directly supported, as envcredible has a different approach to conditional requirements.

3. **Type Inference**: The converter uses runtime type detection, which works well but may not catch all edge cases. Consider testing your converted schemas thoroughly.

## Examples

See [envalid-example.ts](./examples/envalid-example.ts) for a complete working example demonstrating all features of the Envalid converter.