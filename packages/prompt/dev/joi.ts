import Joi from "joi";
import { prompt } from "../src";

console.log("🔧 Ask-Env with Joi Schemas Demo\n");
console.log(
  "This demo shows how to use Joi schemas with ask-env for interactive environment variable collection.",
);
console.log(
  "The Joi schemas are automatically converted to envcredible schemas.\n",
);

// Define Joi schemas for various environment variables
const joiSchemas = {
  APP_NAME: Joi.string()
    .min(3)
    .max(50)
    .required()
    .description("Application name (3-50 characters)"),

  PORT: Joi.number()
    .integer()
    .min(1024)
    .max(65535)
    .default(3000)
    .description("Server port (1024-65535)"),

  NODE_ENV: Joi.string()
    .valid("development", "production", "test", "staging")
    .default("development")
    .description("Node.js environment"),

  DEBUG_MODE: Joi.boolean().default(false).description("Enable debug logging"),

  API_KEY: Joi.string()
    .min(16)
    .pattern(/^[a-zA-Z0-9_-]+$/)
    .required()
    .description("API key for external service (alphanumeric, min 16 chars)"),

  MAX_CONNECTIONS: Joi.number()
    .integer()
    .min(1)
    .max(1000)
    .default(100)
    .description("Maximum database connections (1-1000)"),

  CACHE_TTL: Joi.number()
    .positive()
    .default(3600)
    .description("Cache TTL in seconds"),

  ALLOWED_ORIGINS: Joi.string()
    .pattern(/^https?:\/\//)
    .optional()
    .description("Allowed CORS origins (optional, must be valid URL)"),
};

console.log("Schema validation examples:");
console.log("- APP_NAME: Must be 3-50 characters");
console.log("- PORT: Must be 1024-65535 (integer)");
console.log(
  "- NODE_ENV: Must be one of: development, production, test, staging",
);
console.log("- DEBUG_MODE: Boolean (true/false, yes/no, 1/0)");
console.log("- API_KEY: Min 16 chars, alphanumeric + underscore/dash only");
console.log("- MAX_CONNECTIONS: Integer between 1-1000");
console.log("- CACHE_TTL: Positive number");
console.log("- ALLOWED_ORIGINS: Optional, must be valid URL if provided");
console.log("\nTry these to test validation:");
console.log("- APP_NAME: 'hi' (too short), 'a'.repeat(60) (too long)");
console.log("- PORT: '80' (too low), '70000' (too high)");
console.log("- NODE_ENV: 'invalid' (not in allowed values)");
console.log(
  "- API_KEY: 'short' (too short), 'key with spaces' (invalid chars)",
);
console.log("- ALLOWED_ORIGINS: 'not-a-url' (invalid format)");
console.log("");

await prompt({
  vars: joiSchemas,
  secrets: ["API_KEY"], // Mark API_KEY as secret for masked input
});
