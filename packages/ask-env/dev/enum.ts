import { EnvEnumPrompt } from "../src/prompts/EnvEnumPrompt";

const prompt = new EnvEnumPrompt(
  {
    type: "enum",
    description: "Select the environment",
    required: true,
    default: "production",
    values: ["development", "production", "test"],
  },
  {
    key: "NODE_ENV",
  }
);

await prompt.prompt();