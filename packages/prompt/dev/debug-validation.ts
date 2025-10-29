import Joi from "joi";
import { prompt } from "../src";

console.log("🔍 Debugging Validation Flow\n");

// Test with existing value that should be invalid
const portSchema = Joi.number()
  .integer()
  .min(1024)
  .max(65535)
  .description("Server port (1024-65535)");

console.log("Setting up .env with invalid value...");
await Bun.write("dev/.env", "PORT=2\n");

console.log("Starting ask-env...\n");

await prompt({
  schemas: {
    PORT: portSchema,
  },
  path: "dev/.env",
});
