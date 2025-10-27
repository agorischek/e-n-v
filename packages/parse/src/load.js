"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parse = parse;
const core_1 = require("@e-n-v/core");
const MissingEnvVarError_1 = require("./errors/MissingEnvVarError");
const ValidationError_1 = require("./errors/ValidationError");
const EnvValidationAggregateError_1 = require("./errors/EnvValidationAggregateError");
/**
 * Parse and validate environment variables from a source object
 * Does NOT mutate process.env
 *
 * @param source - Source object containing raw environment variable values
 * @param spec - Environment variable specification (EnvModel instance)
 * @returns Strongly typed validated environment variables
 * @throws EnvValidationAggregateError if any validation errors occur
 */
function parse(source, spec) {
    // Resolve schemas and preprocessing configuration
    const resolvedSchemas = spec.schemas;
    const preprocessConfig = spec.preprocess;
    // Result object and error collection
    const result = {};
    const errors = [];
    // Process each schema
    for (const [key, schema] of Object.entries(resolvedSchemas)) {
        const rawValue = source[key];
        // Handle missing values
        if (rawValue === undefined || rawValue.trim() === "") {
            if (schema.default !== undefined) {
                result[key] = schema.default;
                continue;
            }
            if (schema.required) {
                errors.push(new MissingEnvVarError_1.MissingEnvVarError(key));
                result[key] = undefined;
                continue;
            }
            result[key] = undefined;
            continue;
        }
        // Preprocess the value
        const preprocessor = (0, core_1.resolvePreprocessor)(schema.type, preprocessConfig);
        const preprocessedValue = preprocessor ? preprocessor(rawValue) : rawValue;
        // Convert to string if preprocessor returned native type
        const stringValue = typeof preprocessedValue === "string"
            ? preprocessedValue
            : String(preprocessedValue);
        // Process through schema
        try {
            const processedValue = schema.process(stringValue);
            // Handle undefined result from processor
            if (processedValue === undefined) {
                if (schema.default !== undefined) {
                    result[key] = schema.default;
                }
                else if (schema.required) {
                    errors.push(new MissingEnvVarError_1.MissingEnvVarError(key));
                    result[key] = undefined;
                }
                else {
                    result[key] = undefined;
                }
            }
            else {
                result[key] = processedValue;
            }
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            errors.push(new ValidationError_1.ValidationError(key, rawValue, message));
            result[key] = undefined;
        }
    }
    // Throw aggregate error if there were any errors
    if (errors.length > 0) {
        throw new EnvValidationAggregateError_1.EnvValidationAggregateError(errors);
    }
    return result;
}
