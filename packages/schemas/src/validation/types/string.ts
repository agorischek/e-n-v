import type { Processor } from "@e-n-v/core";
import type { Validator } from "../Validator.js";
import { validate } from "../helpers/validate.js";

/**
 * String processor with validation.
 * Accepts validators that check string requirements.
 */
export function string(...validators: Array<Validator<string>>): Processor<string> {
  return (input: string): string | undefined => {
    // Handle empty values per Processor contract
    if (input === "" || input.trim() === "") {
      return undefined;
    }
    
    return validate(input, validators);
  };
}
