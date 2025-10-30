import type { Check } from "../Check.js";
import { toList } from "./toList.js";

/**
 * Run checks and aggregate errors.
 * Throws an error with all validation requirements if any check fails.
 */
export function validate<T>(value: T, checks: Array<Check<T>>): T {
  const allRequirements = checks
    .map(check => check(value))
    .flat();
  
  if (allRequirements.length > 0) {
    const message = toList(allRequirements);
    throw new Error(`Must be ${message}`);
  }
  
  return value;
}
