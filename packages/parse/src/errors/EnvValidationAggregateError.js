"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnvValidationAggregateError = void 0;
const MissingEnvVarError_1 = require("./MissingEnvVarError");
const ValidationError_1 = require("./ValidationError");
/**
 * Aggregate error thrown when multiple environment variables fail validation
 */
class EnvValidationAggregateError extends Error {
    errors;
    missingVars;
    invalidVars;
    constructor(errors) {
        const missingVars = errors
            .filter((e) => e instanceof MissingEnvVarError_1.MissingEnvVarError)
            .map((e) => e.key);
        const invalidVars = errors
            .filter((e) => e instanceof ValidationError_1.ValidationError)
            .map((e) => e.key);
        const message = EnvValidationAggregateError.formatMessage(missingVars, invalidVars, errors);
        super(message);
        this.name = "EnvValidationAggregateError";
        this.errors = errors;
        this.missingVars = missingVars;
        this.invalidVars = invalidVars;
    }
    static formatMessage(missingVars, invalidVars, errors) {
        const lines = [
            `Environment validation failed with ${errors.length} error${errors.length === 1 ? "" : "s"}:`,
        ];
        // Format all errors in order
        for (const error of errors) {
            if (error instanceof MissingEnvVarError_1.MissingEnvVarError) {
                lines.push(`- ${error.key}: Value is missing`);
            }
            else if (error instanceof ValidationError_1.ValidationError) {
                const errorMsg = error.originalError || `"${error.value}" is invalid`;
                lines.push(`- ${error.key}: ${errorMsg}`);
            }
        }
        return lines.join("\n");
    }
    /**
     * Get all error messages as a formatted string
     */
    getDetailedMessage() {
        return this.errors.map((e, i) => `${i + 1}. ${e.message}`).join("\n");
    }
}
exports.EnvValidationAggregateError = EnvValidationAggregateError;
