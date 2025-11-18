import { EnvNumberPrompt } from "../src/prompts/typed/EnvNumberPrompt";
import { NumberEnvVarSchema } from "@e-n-v/core";

// Simple number processor
const numberProcessor = (value: unknown) => {
  if (typeof value === "number") return value;
  if (typeof value !== "string") {
    throw new Error("Value must be a string or number");
  }
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
