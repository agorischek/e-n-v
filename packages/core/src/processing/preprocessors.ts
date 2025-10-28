/**
 * Default preprocessors for environment variable types.
 * Each preprocessor factory returns a function that takes a string value and returns T | string.
 * Preprocessors may normalize but should not throw—fall back to the original value when normalization fails.
 */
import type { Preprocessor } from "./Preprocessor";

export interface BooleanPreprocessorOptions {
  true: string[];
  false: string[];
}

const defaultBooleanPreprocessorOptions: BooleanPreprocessorOptions = {
  true: ["on", "enabled", "active", "yes"],
  false: ["off", "disabled", "inactive", "no"],
};

/**
 * Create a string preprocessor - pass through unchanged
 */
export const stringPreprocessor = (): Preprocessor<string> => (value) => value;

/**
 * Create a number preprocessor that strips commas and whitespace
 */
export const numberPreprocessor = (): Preprocessor<number> => (value) => {
  try {
    const cleaned = value.replace(/,/g, "").trim();
    if (/^-?\d*\.?\d+$/.test(cleaned)) {
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
export const booleanPreprocessor = (
  options: BooleanPreprocessorOptions = defaultBooleanPreprocessorOptions,
): Preprocessor<boolean> => {
  const normalize = (candidate: string) => candidate.toLowerCase().trim();
  const trueValues = new Set(options.true.map(normalize));
  const falseValues = new Set(options.false.map(normalize));

  for (const candidate of trueValues) {
    if (falseValues.has(candidate)) {
      throw new Error(
        `Boolean preprocessor option value "${candidate}" cannot map to both true and false`,
      );
    }
  }

  return (value) => {
    try {
      const cleaned = normalize(value);

      if (trueValues.has(cleaned)) {
        return true;
      }

      if (falseValues.has(cleaned)) {
        return false;
      }
    } catch {
      // Pass through on any error
    }
    return value;
  };
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
