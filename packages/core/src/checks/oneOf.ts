import type { Check } from "../Check.js";

/**
 * String check: value must be one of allowed values.
 */
export function oneOf<T extends string>(values: readonly T[], requirement?: string): Check<string> {
  return (value: string) => {
    if (!values.includes(value as T)) {
      return requirement 
        ? [requirement]
        : [`one of: ${values.join(", ")}`];
    }
    return [];
  };
}
