import { z } from "zod";
import { ask } from "../src/ask";

const schemas = {
  PORT: z
    .number()
    .int()
    .min(1024)
    .max(65535)
    .describe("Server port (1024-65535)"),
  ENABLE_CACHE: z
    .boolean()
    .describe("Enable cache flag (true or false)"),
  API_BASE_URL: z
    .string()
    .url()
    .describe("Base URL of the API service"),
};

console.log("Running invalid.ts with .invalid.env to highlight invalid current values.\n");

await ask(schemas, {
  path: ".invalid.env",
  root: import.meta.url,
});
