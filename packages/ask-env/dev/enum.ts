import { EnvEnumPrompt } from "../src/prompts/EnvEnumPrompt";

const prompt = new EnvEnumPrompt(
  {
    type: "enum",
    description: "Select the environment",
    required: true,
    nullable: false,
    values: ["development", "production", "test"],
  },
  {
    key: "NODE_ENV",
    current: "development",
    default: "production",
  }
);

await prompt.prompt();