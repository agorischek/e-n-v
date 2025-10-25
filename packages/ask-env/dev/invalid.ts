import { z } from "zod";
import { ask } from "../src/ask";

// Set up invalid values in process.env
process.env.PORT = "three";
process.env.ENABLE_CACHE = "maybe";
process.env.API_BASE_URL = "not-a-valid-url";
process.env.NODE_ENV = "somewhere";

const schemas = {
  PORT: z
    .number()
    .int()
    .min(1024)
    .max(65535)
    .describe("Server port (1024-65535)"),
  ENABLE_CACHE: z.boolean().describe("Enable cache flag (true or false)"),
  API_BASE_URL: z.url().describe("Base URL of the API service"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .describe("Node environment"),
};

console.log(
  "Running invalid.ts with process.env to highlight invalid current values.\n",
);

await ask(schemas, {
  channel: { process },
});
