import { EnvEnumPrompt } from "../src/prompts/EnvEnumPrompt";

const prompt = new EnvEnumPrompt({
  key: "NODE_ENV",
  description: "Select the environment",
  options: ["development", "production", "test"],
  current: "development",
  default: "production",
  required: true
});

await prompt.prompt();