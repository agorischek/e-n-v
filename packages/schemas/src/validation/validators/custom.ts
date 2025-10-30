import type { Validator } from "../Validator.js";

/**
 * Custom validator with user-defined validation function.
 * Can return multiple requirements.
 */
export function custom<T>(
  fn: (value: T) => boolean,
  ...requirements: string[]
): Validator<T> {
  return (value: T) => {
    if (!fn(value)) {
      return requirements;
    }
    return [];
  };
}
