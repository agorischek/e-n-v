import { EnvBooleanPrompt } from "../src/prompts/EnvBooleanPrompt";

const prompt = new EnvBooleanPrompt(
  {
    type: "boolean",
    required: true,
    description: "Enable the feature",
    default: false,
  },
  {
    key: "IS_ENABLED",
    current: false,
    default: false,
  }
);

await prompt.prompt();
