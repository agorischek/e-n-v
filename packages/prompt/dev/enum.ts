import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { EnvEnumPrompt } from "../src/prompts/typed/EnvEnumPrompt";
import { EnumEnvVarSchema } from "@e-n-v/core";

const values = ["development", "production", "test"];

const schema = new EnumEnvVarSchema({
  values,
  description: "Select the environment",
  required: true,
  default: "production",
});

const invalidEnvPath = fileURLToPath(
  new URL("./.invalid.env", import.meta.url),
);
const invalidCurrentValue = "staging";
const invalidEnvContent = `# Sample invalid value for the enum prompt demo
NODE_ENV=${invalidCurrentValue}
`;

await writeFile(invalidEnvPath, invalidEnvContent, "utf8");

const prompt = new EnvEnumPrompt(schema, {
  key: "NODE_ENV",
  current: invalidCurrentValue,
});

await prompt.prompt();
