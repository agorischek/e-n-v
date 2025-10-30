/**
 * Default preprocessors for environment variable types.
 * Each preprocessor factory returns a function that takes a string value and returns T | string.
 * Preprocessors may normalize but should not throw—fall back to the original value when normalization fails.
 */
import { type BooleanCoercionConfig } from "./options/booleanConfig.js";
import { number } from "./preprocessors/number.js";
import { boolean } from "./preprocessors/boolean.js";
import { enumeration } from "./preprocessors/enumeration.js";
import { string } from "./preprocessors/string.js";
export type BooleanPreprocessorOptions = BooleanCoercionConfig;

/**
 * Default preprocessors map for each environment variable type
 */
export const preprocessors = {
  boolean,
  enumeration,
  number,
  string,
} as const;
