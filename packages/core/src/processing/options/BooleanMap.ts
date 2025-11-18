/**
 * Shared boolean coercion configuration.
 * These values are recognized as boolean strings across processors and preprocessors.
 */

export interface BooleanMap {
  /** Values that map to true */
  true: readonly string[];
  /** Values that map to false */
  false: readonly string[];
}
