import { BooleanEnvPrompt } from "./src/prompts/BooleanEnvPrompt";

console.log("Testing BooleanEnvPrompt render...\n");

const prompt = new BooleanEnvPrompt({
  key: "DEBUG_MODE",
  description: "Enable debug logging",
  required: true,
  current: true,
  default: false
});

// Access the render method directly
const rendered = (prompt as any).render();
console.log("Rendered output:");
console.log("================");
console.log(rendered);
console.log("================");
console.log("Length:", rendered?.length);
console.log("Type:", typeof rendered);