import { EnvNumberPrompt } from "../src/prompts/EnvNumberPrompt";

const prompt = new EnvNumberPrompt(
  {
    type: "number",
    required: true,
    description: "Maximum number of concurrent connections",
  },
  {
    key: "MAX_CONNECTIONS",
  }
);

const result = await prompt.prompt();
console.log("MAX_CONNECTIONS=", result);