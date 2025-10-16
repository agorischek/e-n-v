import { EnvEnumPrompt } from "../src/prompts/EnvEnumPrompt";

const prompt = new EnvEnumPrompt(
  {
    type: "enum",
    description: "Select the environment",
    required: true,
    values: ["development", "production", "test"],
  },
  {
    key: "NODE_ENV",
    default: "production",
  }
);

await prompt.prompt();