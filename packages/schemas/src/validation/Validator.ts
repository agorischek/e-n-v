/**
 * Validator type definition.
 * A validator returns an array of requirement strings if validation fails, or an empty array if valid.
 */
export type Validator<T> = (value: T) => string[];
