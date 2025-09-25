import { StringEnvPrompt } from "../src/prompts/StringEnvPrompt";

const prompt = new StringEnvPrompt({
  key: "SERVICE_URL",
  description: "Root URL of the target service",
  current: "awesome",
  default: "cool",
  required: true,
});

await prompt.prompt();
