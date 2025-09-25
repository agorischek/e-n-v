import { NumberEnvPrompt } from "../src/prompts/NumberEnvPrompt";

const prompt = new NumberEnvPrompt({
  key: "MAX_CONNECTIONS",
  description: "Maximum number of concurrent connections",
  required: true,
});

const result = await prompt.prompt();
console.log("MAX_CONNECTIONS=", result);