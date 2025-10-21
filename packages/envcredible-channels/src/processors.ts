/**
 * Default processors for environment variable types.
 * Each processor takes a value of type T and returns T | undefined.
 * Returning undefined indicates the value could not be processed.
 */

/**
 * Process a string value - pass through as-is
 */
export function processString(value: string): string | undefined {
  return value;
}

/**
 * Process a number value using parseFloat
 */
export function processNumber(value: string): number | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }
  
  const trimmed = value.trim();
  if (trimmed === '') {
    return undefined;
  }
  
  const parsed = parseFloat(trimmed);
  return isNaN(parsed) ? undefined : parsed;
}

/**
 * Process a boolean value from string representation
 */
export function processBoolean(value: string): boolean | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }
  
  const trimmed = value.trim().toLowerCase();
  
  if (trimmed === 'true' || trimmed === '1' || trimmed === 'yes' || trimmed === 'on') {
    return true;
  }
  
  if (trimmed === 'false' || trimmed === '0' || trimmed === 'no' || trimmed === 'off') {
    return false;
  }
  
  return undefined;
}

/**
 * Process an enum value - validates it's in the allowed values list
 */
export function processEnum(allowedValues: readonly string[]) {
  return (value: string): string | undefined => {
    if (typeof value !== 'string') {
      return undefined;
    }
    
    return allowedValues.includes(value) ? value : undefined;
  };
}

/**
 * Default processors map for each environment variable type
 */
export const defaultProcessors = {
  string: processString,
  number: processNumber,
  boolean: processBoolean,
  enum: processEnum,
} as const;