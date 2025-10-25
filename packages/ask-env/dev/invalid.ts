import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import { ask } from "../src/ask";

const invalidEnvPath = fileURLToPath(new URL("./.invalid.env", import.meta.url));
const invalidEnvContent = `# Sample invalid values for the invalid.ts demo script
PORT=three
ENABLE_CACHE=maybe
API_BASE_URL=not-a-valid-url
NODE_ENV=somewhere
`;

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
    .url()
    .describe("Base URL of the API service"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .describe("Node environment"),
};

console.log("Running invalid.ts with .invalid.env to highlight invalid current values.\n");

await writeFile(invalidEnvPath, invalidEnvContent, "utf8");

await ask(schemas, {
  path: ".invalid.env",
  root: import.meta.url,
});

await writeFile(invalidEnvPath, invalidEnvContent, "utf8");
