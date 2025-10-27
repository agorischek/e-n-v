"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MissingEnvVarError = void 0;
/**
 * Error thrown when a required environment variable is missing
 */
class MissingEnvVarError extends Error {
    key;
    constructor(key) {
        super(`Required environment variable "${key}" is missing`);
        this.name = "MissingEnvVarError";
        this.key = key;
    }
}
exports.MissingEnvVarError = MissingEnvVarError;
