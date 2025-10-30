/**
 * Custom validators for environment variables.
 * These implement the Processor<T> interface and provide composable validation with clear error messages.
 */

// Core types
export type { Validator } from "./Validator.js";

// Type processors
export { string } from "./types/string.js";
export { number } from "./types/number.js";
export { boolean } from "./types/boolean.js";

// String validators
export { minLength } from "./validators/minLength.js";
export { maxLength } from "./validators/maxLength.js";
export { lengthBetween } from "./validators/lengthBetween.js";
export { exactLength } from "./validators/exactLength.js";
export { pattern } from "./validators/pattern.js";
export { url } from "./validators/url.js";
export { oneOf } from "./validators/oneOf.js";

// Number validators
export { integer } from "./validators/integer.js";
export { min } from "./validators/min.js";
export { max } from "./validators/max.js";
export { between } from "./validators/between.js";

// Custom validator
export { custom } from "./validators/custom.js";

// Helper utilities (for advanced use)
export { toList } from "./helpers/toList.js";
export { validate } from "./helpers/validate.js";
