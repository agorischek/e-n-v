"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.s = exports.schema = exports.spec = exports.EnvSpec = exports.EnvModel = exports.EnvValidationAggregateError = exports.ValidationError = exports.MissingEnvVarError = exports.parse = void 0;
const load_1 = require("./load");
Object.defineProperty(exports, "parse", { enumerable: true, get: function () { return load_1.parse; } });
const MissingEnvVarError_1 = require("./errors/MissingEnvVarError");
Object.defineProperty(exports, "MissingEnvVarError", { enumerable: true, get: function () { return MissingEnvVarError_1.MissingEnvVarError; } });
const ValidationError_1 = require("./errors/ValidationError");
Object.defineProperty(exports, "ValidationError", { enumerable: true, get: function () { return ValidationError_1.ValidationError; } });
const EnvValidationAggregateError_1 = require("./errors/EnvValidationAggregateError");
Object.defineProperty(exports, "EnvValidationAggregateError", { enumerable: true, get: function () { return EnvValidationAggregateError_1.EnvValidationAggregateError; } });
// Re-export EnvModel (EnvSpec is legacy alias)
const models_1 = require("@e-n-v/models");
Object.defineProperty(exports, "EnvModel", { enumerable: true, get: function () { return models_1.EnvModel; } });
Object.defineProperty(exports, "EnvSpec", { enumerable: true, get: function () { return models_1.EnvSpec; } });
Object.defineProperty(exports, "spec", { enumerable: true, get: function () { return models_1.spec; } });
const core_1 = require("@e-n-v/core");
Object.defineProperty(exports, "schema", { enumerable: true, get: function () { return core_1.schema; } });
Object.defineProperty(exports, "s", { enumerable: true, get: function () { return core_1.s; } });
