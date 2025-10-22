import { EnvEnumPrompt } from "../src/prompts/EnvEnumPrompt";
import { EnumEnvVarSchema } from "@envcredible/types";

const values = ["development", "production", "test"];

const schema = new EnumEnvVarSchema({
  values,
  description: "Select the environment",
  required: true,
  default: "production",
});

const prompt = new EnvEnumPrompt(schema, {
  key: "NODE_ENV",
});

await prompt.prompt();
