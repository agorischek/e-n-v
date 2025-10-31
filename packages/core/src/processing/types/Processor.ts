/**
 * Processor function that transforms an input value to type T.
 * Returns T if processing succeeds, undefined for empty/null values, throws descriptive errors for invalid values.
 * Used by environment variable schemas to convert values to their target types.
 */
export type Processor<T> = (value: unknown) => T | undefined;
