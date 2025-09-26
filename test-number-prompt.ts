import { NumberEnvPrompt } from "./src/prompts/NumberEnvPrompt";

async function testNumberPrompt() {
  console.log("Testing NumberEnvPrompt with L-shaped pipe...\n");

  // Test with no current/default values (text-only mode)
  const prompt1 = new NumberEnvPrompt({
    key: "PORT",
    description: "Server port number",
    required: true
  });

  try {
    const result1 = await prompt1.prompt();
    console.log(`Result: ${String(result1)}`);
  } catch (error) {
    console.log(`Error or cancelled: ${error}`);
  }

  console.log("\n---\n");

  // Test with current and default values
  const prompt2 = new NumberEnvPrompt({
    key: "TIMEOUT",
    description: "Request timeout in milliseconds",
    current: 5000,
    default: 3000,
    required: true,
    validate: (value) => {
      if (!value || value < 1000) {
        return "Timeout must be at least 1000ms";
      }
      if (value > 30000) {
        return "Timeout must be less than 30000ms";
      }
      return undefined;
    }
  });

  try {
    const result2 = await prompt2.prompt();
    console.log(`Result: ${String(result2)}`);
  } catch (error) {
    console.log(`Error or cancelled: ${error}`);
  }
}

testNumberPrompt().catch(console.error);