import Joi from "joi";
import { prompt } from "../src";

console.log("🎯 Comprehensive Joi Validation Demo\n");

// Set up some invalid values in .env to test validation
console.log("Setting up .env with some invalid values...");
await Bun.write(
  "dev/.env",
  `
PORT=2
APP_NAME=hi
NODE_ENV=invalid
DEBUG_MODE=maybe
API_KEY=short
MAX_CONNECTIONS=5000
`,
);

console.log("✅ Created .env with invalid values\n");

const schemas = {
  APP_NAME: Joi.string()
    .min(3)
    .max(20)
    .required()
    .description("Application name (3-20 characters)"),

  PORT: Joi.number()
    .integer()
    .min(1024)
    .max(65535)
    .default(3000)
    .description("Server port (1024-65535)"),

  NODE_ENV: Joi.string()
    .valid("development", "production", "test")
    .default("development")
    .description("Environment"),

  DEBUG_MODE: Joi.boolean().default(false).description("Enable debug mode"),

  API_KEY: Joi.string()
    .min(8)
    .max(64)
    .pattern(/^[a-zA-Z0-9_-]+$/)
    .required()
    .description("API key (8-64 alphanumeric chars)"),

  MAX_CONNECTIONS: Joi.number()
    .integer()
    .min(1)
    .max(1000)
    .default(100)
    .description("Max connections (1-1000)"),
};

console.log("Invalid values in .env:");
console.log("- PORT=2 (too low, min 1024)");
console.log("- APP_NAME=hi (too short, min 3 chars)");
console.log("- NODE_ENV=invalid (not in allowed values)");
console.log("- DEBUG_MODE=maybe (not a boolean)");
console.log("- API_KEY=short (too short, min 8 chars)");
console.log("- MAX_CONNECTIONS=5000 (too high, max 1000)");
console.log(
  "\n📝 Notice how invalid current values are marked and blocked from submission!\n",
);

await prompt({
  schemas: schemas,
  path: "dev/.env",
  secrets: ["API_KEY"],
});
