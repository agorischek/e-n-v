# Envcredible Converters Architecture

## Overview

The `envcredible-converters` package (formerly `envcredible-reflection`) provides conversion utilities to transform Zod schemas into the internal `EnvVarSchema` format used by envcredible. This package features a **clean, streamlined architecture** with separate, dedicated conversion paths for Zod v3 and v4.

## Clean Architecture

### Core Files (Essential)

- **`fromZodSchema.ts`** - Main router function that detects schema version and delegates to appropriate converter
- **`zodV3Converter.ts`** - Handles Zod v3 schemas using the `_def` property structure
- **`zodV4Converter.ts`** - Handles Zod v4 schemas using the `_zod` property structure  
- **`utils.ts`** - Backward compatibility utilities (`processWithZodSchema`, `isEnvVarSchema`)
- **`index.ts`** - Clean, organized exports

### Removed Files (Cleanup)

- ❌ **`zodCompat.ts`** - Removed (was redundant compatibility layer)
- ❌ **`processFromSchema.ts`** - Removed (functionality moved to converters + utils)
- ❌ **`EnvVarSchema.ts`** - Removed (was just re-exporting from core)
- ❌ **`dev/`** - Removed (leftover development files)

## Dual Converter System

The package implements a dual converter architecture with completely separate code paths for Zod v3 and v4:

### Version Detection

Schema version is detected by checking for the presence of the `_zod` property:

```typescript
function isZodV4Schema(schema: any): boolean {
  return typeof schema === 'object' && schema !== null && '_zod' in schema;
}

function isZodV3Schema(schema: any): boolean {
  return typeof schema === 'object' && schema !== null && '_def' in schema && !('_zod' in schema);
}
```

### Zod v3 Converter

The v3 converter handles the legacy `_def` property structure and implements:

- **Schema peeling**: Unwraps nested optional, nullable, default, and effects wrappers
- **Type resolution**: Maps Zod types to envcredible types (string, number, boolean, enum)
- **Coercion functions**: Creates environment-specific type coercion using `z.coerce` APIs

### Zod v4 Converter  

The v4 converter leverages Zod v4's new APIs and implements:

- **Native stringbool support**: Uses `z.stringbool()` for environment-style boolean coercion
- **Improved number coercion**: Uses `z.coerce.number()` for string-to-number conversion
- **Streamlined processing**: Takes advantage of v4's performance improvements

## Backward Compatibility

### Utility Functions

To maintain compatibility with existing code, the package provides utility functions:

- **`processWithZodSchema<T>(schema, type, values?)`** - Creates processing functions from Zod schemas
- **`isEnvVarSchema(value)`** - Type guard for EnvVarSchema objects  
- **`isCompatibleZodSchema(value)`** - Type guard for any Zod schema (v3 or v4)

### Migration Path

Existing code using the old API continues to work:

```typescript
// Old usage (still works)
import { processWithZodSchema, isEnvVarSchema } from "@envcredible/converters";

// New usage (preferred)
import { fromZodSchema } from "@envcredible/converters";
```

## Key Features

### Environment Variable Coercion

Both converters support automatic coercion from environment variable strings to appropriate types:

- **Numbers**: `"42"` → `42`, `"3.14"` → `3.14`
- **Booleans**: `"true"`, `"1"`, `"yes"`, `"on"`, `"y"`, `"enabled"` → `true`
- **Booleans**: `"false"`, `"0"`, `"no"`, `"off"`, `"n"`, `"disabled"` → `false`
- **Enums**: String values validated against enum options
- **Strings**: No coercion, passed through as-is

### Schema Analysis

Both converters extract comprehensive schema metadata:

- **Type detection**: Identifies the core data type (string, number, boolean, enum)
- **Requirement analysis**: Determines if the field is required or optional
- **Default value extraction**: Extracts default values (including function defaults)
- **Description extraction**: Pulls description text from various schema locations

### Error Handling

- **Zod v3**: Uses custom error messages matching legacy expectations
- **Zod v4**: Leverages v4's improved error messages and formatting
- **Validation**: Both converters provide detailed error information for invalid values

## Testing

The package includes comprehensive tests covering:

- **Basic type resolution** for all supported types
- **Optional/required field detection**
- **Default value handling** (static and function defaults)
- **Complex nested schemas** with multiple wrappers
- **Description extraction** from various locations
- **Coercion functionality** for all data types
- **Error handling** for invalid inputs
- **Zod v4 stringbool support**
- **Backward compatibility** utilities

## Dependencies

- **@envcredible/core**: Provides `EnvVarSchema` classes
- **zod**: Peer dependency supporting both v3 and v4

## Migration Notes

This package was renamed from `envcredible-reflection` to `envcredible-converters` and completely refactored to support dual Zod versions. The public API remains the same (`fromZodSchema` function), but the internal architecture is entirely new.

The new architecture ensures:

- **Forward compatibility** with Zod v4 features
- **Backward compatibility** with existing Zod v3 schemas  
- **Performance optimization** by using version-specific APIs
- **Maintainability** through separation of concerns
- **Clean codebase** with eliminated redundancy
