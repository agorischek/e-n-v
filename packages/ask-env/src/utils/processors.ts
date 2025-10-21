/**
 * Default processors for environment variable types.
 * Each processor factory returns a function that takes a value and returns T | undefined.
 * Returns undefined for empty/null values, throws descriptive errors for invalid values.
 */

/**
 * Create a string processor - pass through as-is
 */
export const stringProcessor = () => (value: string): string | undefined => {
  if (typeof value !== 'string') {
    throw new Error('Value must be a string');
  }
  
  // Return undefined for empty strings, otherwise return the string
  return value === '' ? undefined : value;
};

/**
 * Create a number processor using parseFloat
 */
export const numberProcessor = () => (value: string): number | undefined => {
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
};

/**
 * Create a boolean processor from string representation
 */
export const booleanProcessor = () => (value: string): boolean | undefined => {
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
};

/**
 * Create an enum processor that validates values against allowed options
 */
export const enumProcessor = (allowedValues: readonly string[]) => (value: string): string | undefined => {
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

/**
 * Default processors map for each environment variable type
 */
export const defaultProcessors = {
  string: stringProcessor,
  number: numberProcessor,
  boolean: booleanProcessor,
  enum: enumProcessor,
} as const;