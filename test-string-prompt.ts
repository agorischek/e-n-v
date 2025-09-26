import { StringEnvPrompt } from "./src/prompts/StringEnvPrompt";

// Test the refactored StringEnvPrompt directly
console.log("Testing StringEnvPrompt with error state...\n");

const prompt = new StringEnvPrompt({
  key: "DATABASE_URL",
  description: "Database connection URL",
  required: true,
  validate: () => 'This is a test error to show error styling in yellow'
});

prompt.prompt().then(result => {
  console.log("Result:", result);
}).catch(error => {
  console.error("Error:", error);
});