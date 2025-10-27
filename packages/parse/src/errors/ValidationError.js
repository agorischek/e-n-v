"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationError = void 0;
/**
 * Error thrown when an environment variable fails validation
 */
class ValidationError extends Error {
    key;
    value;
    originalError;
    constructor(key, value, originalError) {
        const message = originalError
            ? `Environment variable "${key}" validation failed: ${originalError}`
            : `Environment variable "${key}" validation failed for value "${value}"`;
        super(message);
        this.name = "ValidationError";
        this.key = key;
        this.value = value;
        this.originalError = originalError;
    }
}
exports.ValidationError = ValidationError;
