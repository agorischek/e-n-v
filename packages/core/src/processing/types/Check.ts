/**
 * Check type definition.
 * A check returns an array of requirement strings if the check fails, or an empty array if valid.
 */
export type Check<T> = (value: T) => string[];
