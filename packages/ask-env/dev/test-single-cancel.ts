import { EnvStringPrompt } from "../src/prompts/EnvStringPrompt";
import { StringEnvVarSchema } from "@envcredible/types";

console.log("Testing single prompt cancellation");
console.log("Instructions: Cancel with Ctrl+C to see the rendering");
console.log();

// Simple string processor - just returns the input value
const stringProcessor = (value: string) => value;

const schema = new StringEnvVarSchema({
  process: stringProcessor,
  required: true,
  description: "A test value for cancellation",
});

const prompt = new EnvStringPrompt(schema, {
  key: "TEST_VALUE",
});

try {
  const result = await prompt.prompt();
  console.log("Result:", result);
} catch (error) {
  console.log("Caught error:", error);
}
