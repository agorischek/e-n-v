import { string } from "./string";
import { number } from "./number";
import { boolean } from "./boolean";
import { enumeration } from "./enumeration";

/**
 * Default processors for environment variable types.
 * Each processor factory returns a function that takes a value and returns T | undefined.
 * Returns undefined for empty/null values, throws descriptive errors for invalid values.
 */
export const processors = {
  boolean,
  enum: enumeration,
  number,
  string,
} as const;
