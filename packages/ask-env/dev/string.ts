import { EnvStringPrompt } from "../src/prompts/EnvStringPrompt";

const prompt = new EnvStringPrompt(
  {
    type: "string",
    required: true,
    description: "Root URL of the target service",
    default: "cool",
  },
  {
    key: "SERVICE_URL",
    current: "awesome",
  },
);

await prompt.prompt();
