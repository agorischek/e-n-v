import { z } from "zod";
import { EnvPrompt } from "../src/prompts/EnvPrompt";
import { Theme } from "../src/visuals/Theme";
import { resolveSchemas } from "@envcredible/converters";
import { stdin, stdout } from "node:process";
import * as color from "picocolors";

// Test the base EnvPrompt processing
const vars = {
  DEBUG: z.boolean().describe("Enable debug mode").default(false),
};

const schemas = resolveSchemas(vars);
const debugSchema = schemas["DEBUG"];
if (!debugSchema || debugSchema.type !== "boolean") {
  throw new Error("DEBUG schema not found or not boolean");
}
const theme = new Theme(color.magenta);

console.log("🔍 Creating EnvPrompt with existing: 'maybe'");

// Create a minimal test prompt that extends EnvPrompt
class TestPrompt extends EnvPrompt<boolean, any> {
  constructor() {
    super(debugSchema, {
      key: "DEBUG",
      existing: "maybe", // Invalid boolean value
      default: false,
      theme,
      input: stdin,
      output: stdout,
      render: () => "test",
    });
    
    // Log the state after construction
    console.log("📊 Prompt state after construction:");
    console.log("  existing:", this.existing);
    console.log("  current:", this.current);
    console.log("  existingValidationError:", this.existingValidationError);
    console.log("  default:", this.default);
  }
}

new TestPrompt();