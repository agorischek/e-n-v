import { NumberEnvPrompt } from "./src/prompts/NumberEnvPrompt";
import { StringEnvPrompt } from "./src/prompts/StringEnvPrompt";
import { BooleanEnvPrompt } from "./src/prompts/BooleanEnvPrompt";
import { EnumEnvPrompt } from "./src/prompts/EnumEnvPrompt";

async function testAllPrompts() {
  console.log("Testing all prompts with L-shaped pipe...\n");

  // Test NumberEnvPrompt (text-only mode)
  console.log("=== NumberEnvPrompt ===");
  const numberPrompt = new NumberEnvPrompt({
    key: "PORT",
    description: "Server port number",
    required: true,
    validate: (value) => {
      if (!value || value < 1000) {
        return "Port must be at least 1000";
      }
      if (value > 65535) {
        return "Port must be less than 65536";
      }
      return undefined;
    }
  });

  try {
    const numberResult = await numberPrompt.prompt();
    console.log(`NumberEnvPrompt Result: ${String(numberResult)}\n`);
  } catch (error) {
    console.log(`NumberEnvPrompt cancelled: ${error}\n`);
  }

  // Test StringEnvPrompt (text-only mode)
  console.log("=== StringEnvPrompt ===");
  const stringPrompt = new StringEnvPrompt({
    key: "DATABASE_URL",
    description: "Database connection string",
    required: true,
    validate: (value) => {
      if (!value || !value.startsWith("postgresql://")) {
        return "Must be a valid PostgreSQL URL";
      }
      return undefined;
    }
  });

  try {
    const stringResult = await stringPrompt.prompt();
    console.log(`StringEnvPrompt Result: ${String(stringResult)}\n`);
  } catch (error) {
    console.log(`StringEnvPrompt cancelled: ${error}\n`);
  }

  // Test BooleanEnvPrompt
  console.log("=== BooleanEnvPrompt ===");
  const booleanPrompt = new BooleanEnvPrompt({
    key: "DEBUG_MODE",
    description: "Enable debug logging",
    required: true,
    current: true,
    default: false
  });

  try {
    const booleanResult = await booleanPrompt.prompt();
    console.log(`BooleanEnvPrompt Result: ${String(booleanResult)}\n`);
  } catch (error) {
    console.log(`BooleanEnvPrompt cancelled: ${error}\n`);
  }

  // Test EnumEnvPrompt
  console.log("=== EnumEnvPrompt ===");
  const enumPrompt = new EnumEnvPrompt({
    key: "LOG_LEVEL",
    description: "Application log level",
    required: true,
    options: ["debug", "info", "warn", "error"],
    current: "info",
    default: "warn"
  });

  try {
    const enumResult = await enumPrompt.prompt();
    console.log(`EnumEnvPrompt Result: ${String(enumResult)}\n`);
  } catch (error) {
    console.log(`EnumEnvPrompt cancelled: ${error}\n`);
  }

  console.log("All tests completed!");
}

testAllPrompts().catch(console.error);