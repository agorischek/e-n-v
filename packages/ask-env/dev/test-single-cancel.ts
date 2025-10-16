import { EnvStringPrompt } from "../src/prompts/EnvStringPrompt";

console.log("Testing single prompt cancellation");
console.log("Instructions: Cancel with Ctrl+C to see the rendering");
console.log();

const prompt = new EnvStringPrompt(
  {
    type: "string",
    required: true,
    nullable: false,
    description: "A test value for cancellation",
  },
  {
    key: "TEST_VALUE",
  }
);

try {
  const result = await prompt.prompt();
  console.log("Result:", result);
} catch (error) {
  console.log("Caught error:", error);
}