/**
 * Default processors for environment variable types.
 * Each processor takes a value of type T and returns T | undefined.
 * Returns undefined for empty/null values, throws descriptive errors for invalid values.
 */

/**
 * Process a string value - pass through as-is
 */
export function processString(value: string): string | undefined {
  if (typeof value !== 'string') {
    throw new Error('Value must be a string');
  }
  
  // Return undefined for empty strings, otherwise return the string
  return value === '' ? undefined : value;
}

/**
 * Process a number value using parseFloat
 */
export function processNumber(value: string): number | undefined {
  if (typeof value !== 'string') {
    throw new Error('Value must be a string');
  }
  
  const trimmed = value.trim();
  if (trimmed === '') {
    return undefined;
  }
  
  const parsed = parseFloat(trimmed);
  if (isNaN(parsed)) {
    throw new Error(`"${value}" is not a valid number`);
  }
  
  return parsed;
}

/**
 * Process a boolean value from string representation
 */
export function processBoolean(value: string): boolean | undefined {
  if (typeof value !== 'string') {
    throw new Error('Value must be a string');
  }
  
  const trimmed = value.trim().toLowerCase();
  
  if (trimmed === '') {
    return undefined;
  }
  
  if (trimmed === 'true' || trimmed === '1' || trimmed === 'yes' || trimmed === 'on') {
    return true;
  }
  
  if (trimmed === 'false' || trimmed === '0' || trimmed === 'no' || trimmed === 'off') {
    return false;
  }
  
  throw new Error(`"${value}" is not a valid boolean. Use: true/false, 1/0, yes/no, or on/off`);
}

/**
 * Process an enum value - validates it's in the allowed values list
 */
export function processEnum(allowedValues: readonly string[]) {
  return (value: string): string | undefined => {
    if (typeof value !== 'string') {
      throw new Error('Value must be a string');
    }
    
    const trimmed = value.trim();
    if (trimmed === '') {
      return undefined;
    }
    
    if (!allowedValues.includes(trimmed)) {
      throw new Error(`"${value}" is not a valid option. Must be one of: ${allowedValues.join(', ')}`);
    }
    
    return trimmed;
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