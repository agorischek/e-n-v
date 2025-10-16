import { EnvBooleanPrompt } from "../src/prompts/EnvBooleanPrompt";

const prompt = new EnvBooleanPrompt(
  {
    type: "boolean",
    required: true,
    nullable: false,
    description: "Enable the feature",
    defaultValue: false,
  },
  {
    key: "IS_ENABLED",
    current: false,
    default: false,
  }
);

await prompt.prompt();
