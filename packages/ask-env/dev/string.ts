import { EnvStringPrompt } from "../src/prompts/EnvStringPrompt";

const prompt = new EnvStringPrompt({
  key: "SERVICE_URL",
  description: "Root URL of the target service",
  current: "awesome",
  default: "cool",
  required: true,
});

await prompt.prompt();
