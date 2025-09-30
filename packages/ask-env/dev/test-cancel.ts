import { askEnv } from "../src/askEnv";
import { z } from "zod";

// Simple schema for testing cancellation
const schemas = {
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.number().min(1).max(65535).default(3000),
  DATABASE_URL: z.string().min(1),
  ENABLE_LOGGING: z.boolean().default(true)
};

console.log("Testing cancellation behavior");
console.log("Instructions: Try cancelling with Ctrl+C on one of the prompts");
console.log();

try {
  await askEnv(schemas, {
    path: ".env.test"
  });
} catch (error) {
  console.log("Caught error:", error);
}