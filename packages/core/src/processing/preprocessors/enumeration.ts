import type { Preprocessor } from "../types/Preprocessor";

/**
 * Create an enum preprocessor - pass through unchanged
 */
export const enumeration = (): Preprocessor<string> => (value) => value;
