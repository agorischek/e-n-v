import type { Check } from "../Check.js";

/**
 * Custom check with user-defined validation function.
 * Can return multiple requirements.
 */
export function custom<T>(
  fn: (value: T) => boolean,
  ...requirements: string[]
): Check<T> {
  return (value: T) => {
    if (!fn(value)) {
      return requirements;
    }
    return [];
  };
}
