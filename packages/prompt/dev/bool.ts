import { EnvBooleanPrompt } from "../src/prompts/typed/EnvBooleanPrompt";
import { BooleanEnvVarSchema } from "@e-n-v/core";

const schema = new BooleanEnvVarSchema({
  required: true,
  description: "Enable the feature",
  default: false,
});

const prompt = new EnvBooleanPrompt(schema, {
  key: "IS_ENABLED",
  current: "false",
});

await prompt.prompt();
