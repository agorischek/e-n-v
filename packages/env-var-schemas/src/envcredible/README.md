# Environment Variable Schemas

This package provides two ways to define environment variable schemas:

## Default Export: Envcredible Schemas

```typescript
import { apiKey, apiTimeout, port } from "env-var-schemas";
```

**Envcredible schemas** return native `EnvVarSchema` objects that:

- Use Zod validation internally for robust validation
- Support input overrides for customization
- Have a consistent interface across all schemas
- Work directly with `prompt-env` and other envcredible tools

**Example:**

```typescript
// Use with defaults
const schemas = {
  API_KEY: apiKey(),
  API_TIMEOUT: apiTimeout(),
  PORT: port(),
};

// Or customize with input overrides
const customSchemas = {
  API_KEY: apiKey({
    secret: true,
    required: true,
    description: "Your API key",
  }),
  API_TIMEOUT: apiTimeout({
    default: 60,
    description: "Request timeout in seconds",
  }),
};

await ask(customSchemas);
```

## Zod Export: Raw Zod Schemas

```typescript
import { apiKey, apiTimeout, port } from "env-var-schemas/zod";
```

**Zod schemas** return raw Zod schema objects that:

- Are directly modifiable using Zod's API
- Can be composed and extended using Zod methods
- Need conversion with `fromZodSchema()` to work with envcredible tools

**Example:**

```typescript
import { fromZodSchema } from "@envcredible/schemata";

// Get raw Zod schemas
const zodSchemas = {
  API_KEY: apiKey().optional(), // Can chain Zod methods
  API_TIMEOUT: apiTimeout().default(30),
};

// Convert for use with prompt-env
const convertedSchemas = Object.fromEntries(
  Object.entries(zodSchemas).map(([key, schema]) => [
    key,
    fromZodSchema(schema),
  ]),
);

await ask(convertedSchemas);
```

## Which Should You Use?

**Use Envcredible schemas (default export) when:**

- You want a consistent interface across all schemas
- You need input overrides for customization
- You're building applications with envcredible tools
- You want schemas that "just work" without conversion

**Use Zod schemas (`/zod` export) when:**

- You need full access to Zod's chaining API
- You're integrating with existing Zod-based systems
- You want maximum flexibility for schema composition
- You're comfortable with the conversion step

## Available Schemas

### API Schemas

- `apiKey()` - API key validation with minimum length
- `apiBaseUrl()` - URL validation with protocol checking
- `apiTimeout()` - Timeout validation (integer, min/max range)

### Common Schemas

- `port()` - Port number validation (1024-65535)
- `jwtSecret()` - JWT secret with minimum length requirement
- `jwtAccessTokenExpiresIn()` - JWT token duration format
- `jwtRefreshTokenExpiresIn()` - JWT refresh token duration format

## Input Override Pattern

All envcredible schemas support input overrides:

```typescript
const schema = someSchema({
  description: "Custom description",
  required: false,
  default: "custom-default",
  secret: true, // For StringEnvVarSchema only
  // Any other EnvVarSchemaInput properties
});
```

This allows you to customize any aspect of the schema while keeping the core validation logic intact.
