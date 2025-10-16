import { EnvStringPrompt } from "../src/prompts/EnvStringPrompt";

const prompt = new EnvStringPrompt(
  {
    type: "string",
    required: true,
    nullable: false,
    description: "Root URL of the target service",
    defaultValue: "cool",
  },
  {
    key: "SERVICE_URL",
    current: "awesome",
    default: "cool",
  }
);

await prompt.prompt();
