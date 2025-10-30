import type { Processor } from "@e-n-v/core";
import type { Validator } from "../Validator.js";
import { validate } from "../helpers/validate.js";

/**
 * Number processor with validation.
 * Coerces string input to number and applies validators.
 */
export function number(...validators: Array<Validator<number>>): Processor<number> {
  return (input: string): number | undefined => {
    // Handle empty values per Processor contract
    const trimmed = input.trim();
    if (trimmed === "") {
      return undefined;
    }
    
    // Coerce to number
    const num = Number(trimmed);
    if (isNaN(num)) {
      throw new Error("Must be a valid number");
    }
    
    return validate(num, validators);
  };
}
