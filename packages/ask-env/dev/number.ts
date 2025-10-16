import { EnvNumberPrompt } from "../src/prompts/EnvNumberPrompt";

const prompt = new EnvNumberPrompt(
  {
    type: "number",
    required: true,
    description: "Server port number",
    preset: 8080,
  },
  {
    key: "PORT",
    default: 8080,
  }
);

const result = await prompt.prompt();
console.log("PORT=", result);