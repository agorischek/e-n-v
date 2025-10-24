import { ask } from "../src";
import { resolveSchema } from "@envcredible/converters";

// Import Zod schemas from the zod export
import {
  apiKey as zodApiKey,
  apiBaseUrl as zodApiBaseUrl,
} from "env-var-schemas/zod";

// Import envcredible schemas from the default export
import {
  apiKey as envcredibleApiKey,
  apiBaseUrl as envcredibleApiBaseUrl,
} from "env-var-schemas";

console.log("=== Comparing Zod vs Envcredible Schemas ===\n");

// Method 1: Using Zod schemas (need conversion)
console.log("1. Using Zod schemas (requires fromZodSchema conversion):");
const zodSchemas = {
  API_KEY: resolveSchema(zodApiKey()),
  API_BASE_URL: resolveSchema(zodApiBaseUrl()),
};

// Method 2: Using envcredible schemas (direct use)
console.log("2. Using envcredible schemas (direct use with input overrides):");
const envcredibleSchemas = {
  API_KEY: envcredibleApiKey({ secret: true }),
  API_BASE_URL: envcredibleApiBaseUrl({ required: false }),
};

console.log("\n=== Testing Zod-based schemas ===");
await ask(zodSchemas, {
  secrets: ["API_KEY"],
});

console.log("\n=== Testing Envcredible schemas ===");
await ask(envcredibleSchemas, {
  secrets: ["API_KEY"],
});
