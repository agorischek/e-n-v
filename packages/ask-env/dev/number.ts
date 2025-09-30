import { EnvNumberPrompt } from "../src/prompts/EnvNumberPrompt";

const prompt = new EnvNumberPrompt({
  key: "PORT",
  description: "Server port number",
  current: 3000,
  default: 8080,
  required: true,
});

const result = await prompt.prompt();
console.log("PORT=", result);