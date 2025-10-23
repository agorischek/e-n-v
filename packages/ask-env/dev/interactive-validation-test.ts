import Joi from "joi";
import { ask } from "../src";

console.log("🧪 Interactive Validation Test\n");

// Simple port test - no default to force user input
const portSchema = Joi.number().integer().min(1024).max(65535).description("Server port (1024-65535)");

console.log("Try entering '2' - it should be rejected for being too low\n");

await ask({
  PORT: portSchema,
});