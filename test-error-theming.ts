import { StringEnvPrompt } from "./src/prompts/StringEnvPrompt";

// Test the error state theming directly
console.log("Testing error state theming...\n");

const prompt = new StringEnvPrompt({
  key: "DATABASE_URL",
  description: "Database connection URL",
  required: true,
  validate: (value) => {
    if (value && value.includes("invalid")) {
      return "This should trigger yellow error theming!";
    }
    return undefined;
  }
});

// We'll manually test this by typing "invalid" to trigger the error state
prompt.prompt().then(result => {
  console.log("Final result:", result);
}).catch(error => {
  console.log("Cancelled or error:", error);
});