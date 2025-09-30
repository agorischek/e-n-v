import { EnvBooleanPrompt } from "../src/prompts/EnvBooleanPrompt";

const prompt = new EnvBooleanPrompt({
  key: "IS_ENABLED",
  required: true,
    description: "Enable the feature",
    current: false,
    default: false
});

await prompt.prompt();
