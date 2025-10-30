/**
 * Custom checks for environment variables.
 * These implement the Processor<T> interface and provide composable validation with clear error messages.
 */

// Core types
export type { Check } from "./Check.js";

// Type processors
export { string } from "./types/string.js";
export { number } from "./types/number.js";
export { boolean } from "./types/boolean.js";
export { enum_ } from "./types/enum.js";

// String checks
export { minLength } from "./checks/minLength.js";
export { maxLength } from "./checks/maxLength.js";
export { lengthBetween } from "./checks/lengthBetween.js";
export { exactLength } from "./checks/exactLength.js";
export { pattern } from "./checks/pattern.js";
export { url } from "./checks/url.js";
export { oneOf } from "./checks/oneOf.js";

// Number checks
export { integer } from "./checks/integer.js";
export { min } from "./checks/min.js";
export { max } from "./checks/max.js";
export { between } from "./checks/between.js";

// Custom check
export { custom } from "./checks/custom.js";

// Helper utilities (for advanced use)
export { toList } from "./helpers/toList.js";
export { validate } from "./helpers/validate.js";
