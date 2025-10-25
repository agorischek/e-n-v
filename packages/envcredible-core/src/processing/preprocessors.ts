/**
 * Default preprocessors for environment variable types.
 * Each preprocessor factory returns a function that takes a string value and returns T | string.
 * Preprocessors may normalize but should not throw—fall back to the original value when normalization fails.
 */
import type { Preprocessor } from "./Preprocessor";

/**
 * Create a string preprocessor - pass through unchanged
 */
export const stringPreprocessor = (): Preprocessor<string> => (value) => value;

/**
 * Create a number preprocessor that strips commas and whitespace
 */
export const numberPreprocessor = (): Preprocessor<number> => (value) => {
  try {
    const cleaned = parseFloat(value);
    if (!isNaN(cleaned)) {
      return cleaned;
    }
  } catch {
    // Pass through on any error
  }
  return value;
};

/**
 * Create a boolean preprocessor that normalizes common truthy/falsy phrases
 */
export const booleanPreprocessor = (): Preprocessor<boolean> => (value) => {
  try {
    const cleaned = value.toLowerCase().trim();

    if (cleaned === "true" || cleaned === "yes" || cleaned === "1") {
      return true;
    }

    if (cleaned === "false" || cleaned === "no" || cleaned === "0") {
      return false;
    }
  } catch {
    // Pass through on any error
  }
  return value;
};

/**
 * Create an enum preprocessor - pass through unchanged
 */
export const enumPreprocessor = (): Preprocessor<string> => (value) => value;

/**
 * Default preprocessors map for each environment variable type
 */
export const preprocessors = {
  string: stringPreprocessor,
  number: numberPreprocessor,
  boolean: booleanPreprocessor,
  enum: enumPreprocessor,
} as const;
