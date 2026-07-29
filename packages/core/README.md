# e·n·v core

Shared TypeScript types and utilities for e·n·v: `EnvChannel`, `EnvVarSchema`, etc.

## Overview

This package provides the core types, interfaces, and utilities used across all e·n·v packages. It includes schema definitions, channel interfaces, error types, and preprocessing utilities.

## Processing

e·n·v has three types of processing functions, which serve related but distinct purposes.

- **Preprocessors**: These perform a "best effort" to coerce environment variable strings to more specific types, and otherwise prepare them for variable-specific processing. This allows, for example, coercing boolean strings in a standard way. Preprocessors can return any type, including passing through the source string unchanged. If a preprocessor throws, the error is ignored and the original value is passed through.
- **Checks**: These determine whether some value possesses one or more traits, and then returns a list of strings indicating the necessary traits that they lack. These can be used to build processors.
- **Processors**: These perform the strict, detailed, variable-specific verification. Processors should accept any input type (not just strings). If a processor throws, it means the environment variable is invalid.

There is some amount of overlap between preprocessors and processors (e.g. both may have coercion logic), however, keeping them separate allows for easier use of external schema libraries.

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

### Error Handling

Runtime error types now live in `@e-n-v/parse`. Use `EnvParseError` from that package to inspect validation issues.

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
