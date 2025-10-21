/**
 * Minimal shape of the PromptOptions Validate type used by other packages.
 * Kept intentionally tiny to avoid coupling to the ask-env vendor internals.
 */
export type Validate<T> = (value: T | undefined) => string | Error | undefined;
