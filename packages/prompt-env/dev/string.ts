import { EnvStringPrompt } from "../src/prompts/typed/EnvStringPrompt";
import { StringEnvVarSchema } from "@envcredible/core";

const schema = new StringEnvVarSchema({
  required: true,
  description: "Root URL of the target service",
  default: "cool",
});

const prompt = new EnvStringPrompt(schema, {
  key: "SERVICE_URL",
  current: "awesome",
});

await prompt.prompt();
