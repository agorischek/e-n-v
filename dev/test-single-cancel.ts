import { EnvStringPrompt } from "../src/prompts/EnvStringPrompt";

console.log("Testing single prompt cancellation");
console.log("Instructions: Cancel with Ctrl+C to see the rendering");
console.log();

const prompt = new EnvStringPrompt({
  key: "TEST_VALUE",
  description: "A test value for cancellation",
  required: true
});

try {
  const result = await prompt.prompt();
  console.log("Result:", result);
} catch (error) {
  console.log("Caught error:", error);
}