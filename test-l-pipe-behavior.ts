import { NumberEnvPrompt } from "./src/prompts/NumberEnvPrompt";
import { StringEnvPrompt } from "./src/prompts/StringEnvPrompt";
import { BooleanEnvPrompt } from "./src/prompts/BooleanEnvPrompt";
import { EnumEnvPrompt } from "./src/prompts/EnumEnvPrompt";

console.log("Testing L-shaped pipe behavior:\n");

console.log("=== NumberEnvPrompt (with placeholder text) ===");
const numberPrompt = new NumberEnvPrompt({
  key: "PORT",
  description: "Server port",
  required: true
});
console.log((numberPrompt as any).render());

console.log("\n=== StringEnvPrompt (with placeholder text) ===");
const stringPrompt = new StringEnvPrompt({
  key: "DATABASE_URL", 
  description: "Database URL",
  required: true
});
console.log((stringPrompt as any).render());

console.log("\n=== BooleanEnvPrompt (L-shaped pipe only) ===");
const booleanPrompt = new BooleanEnvPrompt({
  key: "DEBUG_MODE",
  description: "Enable debug",
  required: true,
  current: true,
  default: false
});
console.log((booleanPrompt as any).render());

console.log("\n=== EnumEnvPrompt (L-shaped pipe only) ===");
const enumPrompt = new EnumEnvPrompt({
  key: "LOG_LEVEL",
  description: "Log level",
  required: true,
  options: ["debug", "info", "warn", "error"],
  current: "info"
});
console.log((enumPrompt as any).render());