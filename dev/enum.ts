import { EnumEnvPrompt } from "../src/prompts/EnumEnvPrompt";

const prompt = new EnumEnvPrompt({
  key: "NODE_ENV",
  description: "Select the environment",
  options: ["development", "production", "test"],
  current: "development",
  default: "production",
  required: true
});

await prompt.prompt();