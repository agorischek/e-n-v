import { EnvNumberPrompt } from "../src/prompts/EnvNumberPrompt";
import { NumberEnvVarSchema } from "@envcredible/types";

// Simple number processor
const numberProcessor = (value: string) => {
  const parsed = Number(value);
  if (isNaN(parsed)) {
    throw new Error(`"${value}" is not a valid number`);
  }
  return parsed;
};

const schema = new NumberEnvVarSchema({
  process: numberProcessor,
  required: true,
  description: "Maximum number of concurrent connections",
});

const prompt = new EnvNumberPrompt(schema, {
  key: "MAX_CONNECTIONS",
});

const result = await prompt.prompt();
console.log("MAX_CONNECTIONS=", result);
