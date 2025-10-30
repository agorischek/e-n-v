/**
 * Default preprocessors for environment variable types.
 * Each preprocessor factory returns a function that takes a string value and returns T | string.
 * Preprocessors may normalize but should not throw—fall back to the original value when normalization fails.
 */
import { number } from "./number.js";
import { boolean } from "./boolean.js";
import { enumeration } from "./enumeration.js";
import { string } from "./string.js";

/**
 * Default preprocessors map for each environment variable type
 */
export const preprocessors = {
  boolean,
  enum: enumeration,
  number,
  string,
} as const;
