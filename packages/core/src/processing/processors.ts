import type { Processor } from "./types/Processor";
import { string } from "../validation/types/string.js";
import { number } from "../validation/types/number.js";
import { boolean } from "../validation/types/boolean.js";
import { enum_ } from "../validation/types/enum.js";

/**
 * Default processors for environment variable types.
 * Each processor factory returns a function that takes a value and returns T | undefined.
 * Returns undefined for empty/null values, throws descriptive errors for invalid values.
 * 
 * These are thin wrappers around the validation type processors, called with no checks.
 */
export const processors = {
  /**
   * Create a string processor - pass through as-is
   */
  string: (): Processor<string> => string(),

  /**
   * Create a number processor using parseFloat
   */
  number: (): Processor<number> => number(),

  /**
   * Create a boolean processor from string representation
   */
  boolean: (): Processor<boolean> => boolean(),

  /**
   * Create an enum processor that validates values against allowed options
   */
  enum: (allowedValues: readonly string[]): Processor<string> => enum_(allowedValues),
} as const;
