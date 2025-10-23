import { z } from "zod";
import { EnvStringPrompt } from "../src/prompts/typed/EnvStringPrompt";
import { Theme } from "../src/visuals/Theme";
import { resolveSchemas } from "@envcredible/converters";
import { stdin, stdout } from "node:process";
import * as color from "picocolors";

// Test the string prompt directly to see cursor state
const vars = {
  EMAIL: z.string().email().describe("User email address"),
};

const schemas = resolveSchemas(vars);
const debugSchema = schemas["EMAIL"];
if (!debugSchema || debugSchema.type !== "string") {
  throw new Error("EMAIL schema not found or not string");
}
const theme = new Theme(color.magenta);

console.log("🔍 Creating string prompt with existing: 'not-a-valid-email'");

const prompt = new EnvStringPrompt(debugSchema, {
  key: "EMAIL",
  existing: "not-a-valid-email", // Invalid email value
  theme,
  input: stdin,
  output: stdout,
});

// Add debugging to see the prompt state
console.log("📊 Prompt state after creation:");
console.log("  existing:", (prompt as any).existing);
console.log("  current:", (prompt as any).current);
console.log("  default:", (prompt as any).default);
console.log("  existingValidationError:", (prompt as any).existingValidationError);
console.log("  isTyping:", (prompt as any).isTyping);
console.log("  cursor:", (prompt as any).cursor);
console.log("  getTextInputIndex():", (prompt as any).getTextInputIndex());

// Check expected behavior:
console.log("\n🎯 Expected behavior:");
console.log("  - cursor should be on text input index (1)");
console.log("  - isTyping should be true");
console.log("  - cursor should NOT be 0 (invalid option)");

process.exit(0);