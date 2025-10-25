# Aggregate Error Implementation

## Summary

Updated `direct-env` to collect **all** validation errors before throwing, providing a complete picture of what's wrong instead of failing on the first error.

## Changes Made

### 1. New Error Class: `EnvValidationAggregateError`

**File:** `/workspaces/envcredible/packages/direct-env/src/errors/EnvValidationAggregateError.ts`

A new aggregate error class that:
- Contains an array of all `MissingEnvVarError` and `ValidationError` instances
- Separates missing vars and invalid vars for easy access
- Provides formatted error messages showing all issues
- Includes `getDetailedMessage()` method for comprehensive error output

**Properties:**
- `errors: Array<MissingEnvVarError | ValidationError>` - All collected errors
- `missingVars: string[]` - List of missing variable names
- `invalidVars: string[]` - List of invalid variable names
- `message: string` - Formatted summary of all errors

**Methods:**
- `getDetailedMessage(): string` - Returns all error messages with numbering

### 2. Updated Load Function

**File:** `/workspaces/envcredible/packages/direct-env/src/load.ts`

Modified to:
- Collect errors in an array instead of throwing immediately
- Continue validating all variables even when errors occur
- Throw `EnvValidationAggregateError` at the end if any errors were found
- Maintain backward compatibility with non-strict mode

**Before:**
```typescript
if (schema.required && strict) {
  throw new MissingEnvVarError(key);
}
```

**After:**
```typescript
if (schema.required && strict) {
  errors.push(new MissingEnvVarError(key));
}
// ... continue processing other vars ...

// At the end:
if (strict && errors.length > 0) {
  throw new EnvValidationAggregateError(errors);
}
```

### 3. Updated Exports

**File:** `/workspaces/envcredible/packages/direct-env/src/index.ts`

Added export for `EnvValidationAggregateError`

### 4. Updated Tests

**File:** `/workspaces/envcredible/packages/direct-env/src/__tests__/load.test.ts`

- Updated existing tests to expect `EnvValidationAggregateError` instead of individual errors
- Added 3 new tests:
  - `collects multiple errors in aggregate error` - Verifies 4 errors collected
  - `aggregate error includes all validation errors` - Tests mixed error types
  - `aggregate error provides detailed messages` - Tests message formatting

**Test Results:** 12/12 passing ✅

### 5. Updated Demo

**File:** `/workspaces/envcredible/packages/direct-env/demo/errors.ts`

Replaced individual error examples with aggregate error demonstrations showing:
- Multiple errors collected at once
- Accessing `missingVars` and `invalidVars` arrays
- Formatted error messages
- Detailed error output

### 6. Updated Documentation

**File:** `/workspaces/envcredible/packages/direct-env/README.md`

Added comprehensive "Error Handling" section showing:
- Aggregate error usage with examples
- How to access individual errors within aggregate
- Non-strict mode behavior
- Error message formatting

### 7. Updated Validation Script

**File:** `/workspaces/envcredible/validate.ts`

Added Step 6 to test aggregate error collection with 4 errors (2 missing, 2 invalid)

## Example Usage

```typescript
import { load, EnvValidationAggregateError, schema } from "direct-env";

try {
  const env = await load({
    path: ".env",
    vars: {
      PORT: schema.number(),
      DATABASE_URL: schema.string(),
      DEBUG: schema.boolean(),
      API_KEY: schema.string(),
    }
  });
} catch (error) {
  if (error instanceof EnvValidationAggregateError) {
    console.error(`Found ${error.errors.length} errors`);
    console.error(`Missing: ${error.missingVars.join(", ")}`);
    console.error(`Invalid: ${error.invalidVars.join(", ")}`);
    console.error("\nDetails:\n" + error.getDetailedMessage());
  }
}
```

## Error Message Format

```
Environment validation failed with 4 errors:

Missing required variables (2):
  - REQUIRED_KEY1
  - REQUIRED_KEY2

Invalid values (2):
  - PORT: "not-a-number" is not a valid number
  - DEBUG: "maybe" is not a valid boolean. Use: true/false, 1/0, yes/no, or on/off
```

## Benefits

1. **Better Developer Experience**: See all issues at once instead of fixing one at a time
2. **Faster Debugging**: Complete picture of configuration problems
3. **Production Ready**: Comprehensive error reporting for deployment issues
4. **Backward Compatible**: Non-strict mode still works as before
5. **Type Safe**: Proper error types for each category

## Validation Results

✅ All 12 tests passing
✅ Demo runs successfully
✅ Validation script passes
✅ Documentation updated
✅ Backward compatible with existing code
