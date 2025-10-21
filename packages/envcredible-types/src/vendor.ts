/**
 * Process function that transforms a string input to type T.
 * Returns T if processing succeeds, undefined if it fails.
 * Used by environment variable schemas to convert string values to their target types.
 */
export type Process<T> = (value: string) => T | undefined;
