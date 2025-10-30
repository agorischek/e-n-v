import type { Validator } from "../Validator.js";
import { toList } from "./toList.js";

/**
 * Run validators and aggregate errors.
 * Throws an error with all validation requirements if any validator fails.
 */
export function validate<T>(value: T, validators: Array<Validator<T>>): T {
  const allRequirements = validators
    .map(validator => validator(value))
    .flat();
  
  if (allRequirements.length > 0) {
    const message = toList(allRequirements);
    throw new Error(`Must be ${message}`);
  }
  
  return value;
}
