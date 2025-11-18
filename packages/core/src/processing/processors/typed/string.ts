import type { Processor } from "../../types/Processor.js";
import type { Check } from "../../types/Check.js";
import { validate } from "../../helpers/validate.js";

/**
 * String processor with optional validation checks.
 * This is the primary string processor - the base stringProcessor() calls this with no checks.
 */
export function string(...checks: Array<Check<string>>): Processor<string> {
  return (input: unknown): string | undefined => {
    if (typeof input !== "string") {
      throw new Error("Value must be a string");
    }

    // Return undefined for empty strings, otherwise return the string
    if (input === "") {
      return undefined;
    }

    // Apply validation checks if any were provided
    if (checks.length > 0) {
      return validate(input, checks);
    }

    return input;
  };
}
