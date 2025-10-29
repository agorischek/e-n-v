import { prompt } from "../src";
import { apiKey, apiTimeout, port } from "@e-n-v/schemas";

console.log("=== Envcredible Schema Validation Demo ===\n");
console.log(
  "This demo shows how Zod validation works internally with envcredible schemas.",
);
console.log("Try entering invalid values to see the validation in action!\n");

// Test validation with various constraints
const validationSchemas = {
  API_KEY: apiKey({
    description: "API key (min 8 characters)",
    required: true,
    secret: true,
  }),

  API_TIMEOUT: apiTimeout({
    description: "Timeout in seconds (1-300, must be integer)",
    default: 30,
  }),

  PORT: port({
    description: "Server port (1024-65535, must be integer)",
    default: 3000,
  }),
};

console.log("Schema validation examples:");
console.log("- API_KEY: Must be at least 8 characters");
console.log("- API_TIMEOUT: Must be 1-300 seconds (integer)");
console.log("- PORT: Must be 1024-65535 (integer)");
console.log("\nTry these invalid inputs to see validation:");
console.log("- API_KEY: 'short' (too short)");
console.log("- API_TIMEOUT: '500' (too high), 'abc' (not a number)");
console.log(
  "- PORT: '80' (too low), '70000' (too high), '3000.5' (not integer)",
);
console.log("");

await prompt({
  schemas: validationSchemas,
  secrets: ["API_KEY"],
});
