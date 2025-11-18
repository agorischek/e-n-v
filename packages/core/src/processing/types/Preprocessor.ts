/**
 * Custom preprocessing functions to preprocess values before submitting to schema processors.
 * Provide `false` to skip preprocessing, `true` to use the built-in default, or a function/options object for custom logic.
 * These functions do not guarantee type casting and can be bypassed to skip preprocessing entirely.
 */
export type Preprocessor<T> = (value: string) => T | string;

export type PreprocessorToggle<T> = Preprocessor<T> | boolean | undefined;
