import type { Processor } from "../../types/Processor.js";
import type { Check } from "../../types/Check.js";
import { validate } from "../../helpers/validate.js";

/**
 * Number processor with optional validation checks.
 * This is the primary number processor - the base numberProcessor() calls this with no checks.
 */
export function number(...checks: Array<Check<number>>): Processor<number> {
  return (input: string): number | undefined => {
    if (typeof input !== "string") {
      throw new Error("Value must be a string");
    }

    const trimmed = input.trim();
    if (trimmed === "") {
      return undefined;
    }

    const parsed = parseFloat(trimmed);
    if (isNaN(parsed)) {
      throw new Error(`"${input}" is not a valid number`);
    }

    // Apply validation checks if any were provided
    if (checks.length > 0) {
      return validate(parsed, checks);
    }
    
    return parsed;
  };
}
