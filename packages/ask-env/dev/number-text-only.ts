import { EnvNumberPrompt } from "../src/prompts/EnvNumberPrompt";

const prompt = new EnvNumberPrompt({
  key: "MAX_CONNECTIONS",
  description: "Maximum number of concurrent connections",
  required: true,
});

const result = await prompt.prompt();
console.log("MAX_CONNECTIONS=", result);