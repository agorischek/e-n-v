import { string } from "./typed/string";
import { number } from "./typed/number";
import { boolean } from "./typed/boolean";
import { enumeration } from "./typed/enumeration";

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
