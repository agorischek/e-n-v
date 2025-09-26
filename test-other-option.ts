import { NumberEnvPrompt } from "./src/prompts/NumberEnvPrompt";
import { StringEnvPrompt } from "./src/prompts/StringEnvPrompt";

console.log("Testing 'Other' option text:\n");

console.log("=== NumberEnvPrompt (should show 'Other') ===");
const numberPrompt = new NumberEnvPrompt({
  key: "PORT",
  description: "Server port",
  required: true,
  current: 3000,
  default: 8080
});
console.log((numberPrompt as any).render());

console.log("\n=== StringEnvPrompt (should show 'Other') ===");
const stringPrompt = new StringEnvPrompt({
  key: "DATABASE_URL", 
  description: "Database URL",
  required: true,
  current: "postgresql://localhost/mydb",
  default: "postgresql://localhost/defaultdb"
});
console.log((stringPrompt as any).render());