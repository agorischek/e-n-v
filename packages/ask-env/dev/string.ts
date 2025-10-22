import { EnvStringPrompt } from "../src/prompts/EnvStringPrompt";
import { StringEnvVarSchema } from "@envcredible/types";

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
