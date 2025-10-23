import { z } from "zod";
import { EnvBooleanPrompt } from "../src/prompts/typed/EnvBooleanPrompt";
import { Theme } from "../src/visuals/Theme";
import { resolveSchemas } from "@envcredible/converters";
import { stdin, stdout } from "node:process";
import * as color from "picocolors";
import * as defaults from "../src/defaults";

// Test the boolean prompt directly
const vars = {
  DEBUG: z.boolean().describe("Enable debug mode").default(false),
};

const schemas = resolveSchemas(vars);
const debugSchema = schemas.find(s => s.key === "DEBUG");
if (!debugSchema || debugSchema.type !== "boolean") {
  throw new Error("DEBUG schema not found or not boolean");
}

const theme = new Theme(color.magenta);

console.log("🔍 Creating prompt with existing: 'maybe'");

const prompt = new EnvBooleanPrompt(debugSchema, {
  key: "DEBUG",
  existing: "maybe", // Invalid boolean value
  default: false,
  theme,
  input: stdin,
  output: stdout,
});

// Add debugging to see the prompt state
console.log("📊 Prompt state after creation:");
console.log("  existing:", (prompt as any).existing);
console.log("  current:", (prompt as any).current);
console.log("  existingValidationError:", (prompt as any).existingValidationError);
console.log("  default:", (prompt as any).default);

// Start the prompt
console.log("🚀 Starting prompt...");
await prompt.prompt();