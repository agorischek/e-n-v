import { StringEnvPrompt } from "./src/prompts/StringEnvPrompt";
import { BooleanEnvPrompt } from "./src/prompts/BooleanEnvPrompt";
import { EnumEnvPrompt } from "./src/prompts/EnumEnvPrompt";

async function testAllRenders() {
  console.log("Testing all prompt renders with L-shaped pipe...\n");

  console.log("=== StringEnvPrompt ===");
  const stringPrompt = new StringEnvPrompt({
    key: "DATABASE_URL",
    description: "Database connection string",
    required: true
  });
  console.log((stringPrompt as any).render());

  console.log("\n=== BooleanEnvPrompt ===");
  const booleanPrompt = new BooleanEnvPrompt({
    key: "DEBUG_MODE",
    description: "Enable debug logging",
    required: true,
    current: true,
    default: false
  });
  console.log((booleanPrompt as any).render());

  console.log("\n=== EnumEnvPrompt ===");
  const enumPrompt = new EnumEnvPrompt({
    key: "LOG_LEVEL",
    description: "Application log level",
    required: true,
    options: ["debug", "info", "warn", "error"],
    current: "info",
    default: "warn"
  });
  console.log((enumPrompt as any).render());
}

testAllRenders().catch(console.error);