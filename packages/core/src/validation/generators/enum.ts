import type { Processor } from "../types/Processor.js";
import type { Check } from "../types/Check.js";
import { validate } from "../helpers/validate.js";

/**
 * Enum processor with optional validation checks.
 * This is the primary enum processor - the base enumProcessor() calls this with no checks.
 */
export function enum_(
  allowedValues: readonly string[],
  ...checks: Array<Check<string>>
): Processor<string> {
  return (input: string): string | undefined => {
    if (typeof input !== "string") {
      throw new Error("Value must be a string");
    }

    const trimmed = input.trim();
    if (trimmed === "") {
      return undefined;
    }

    if (!allowedValues.includes(trimmed)) {
      throw new Error(
        `"${input}" is not a valid option. Must be one of: ${allowedValues.join(", ")}`,
      );
    }

    // Apply validation checks if any were provided
    if (checks.length > 0) {
      return validate(trimmed, checks);
    }

    return trimmed;
  };
}
