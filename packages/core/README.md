# e·n·v Core

Shared TypeScript types and utilities for e·n·v: `EnvChannel`, `EnvVarSchema`, etc.

## Overview

This package provides the core types, interfaces, and utilities used across all e·n·v packages. It includes schema definitions, channel interfaces, error types, and preprocessing utilities.

## Installation

```bash
npm install @e-n-v/core
# or
bun add @e-n-v/core
```

This package is types-only and intended to be used as a dev/peer dependency.

## Main Exports

### Types

- `EnvVarSchema` - Base schema class for environment variables
- `EnvChannel` - Interface for reading/writing environment variables
- `EnvModel` - Environment variable model definition
- `Preprocessors` - Type definitions for value preprocessing

### Schema Classes

- `StringEnvVarSchema`
- `NumberEnvVarSchema`
- `BooleanEnvVarSchema`
- `EnumEnvVarSchema`

### Error Types

- `EnvValidationAggregateError`
- `MissingEnvVarError`
- `ValidationError`

## Usage

Typically imported by other e·n·v packages:

```typescript
import { EnvVarSchema, EnvChannel } from "@e-n-v/core";
```

## Related Packages

- **[@e-n-v/models](../models)**: Environment variable specifications using these types
- **[@e-n-v/channels](../channels)**: Channel implementations using `EnvChannel`
- **[@e-n-v/converters](../converters)**: Schema converters using `EnvVarSchema`

## License

MIT
