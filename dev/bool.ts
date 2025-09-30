import { BooleanEnvPrompt } from "../src/prompts/BooleanEnvPrompt";

const prompt = new BooleanEnvPrompt({
  key: "IS_ENABLED",
  required: true,
  description: "Enable the feature",
  current: false,
  default: false,
});

await prompt.prompt();
