import { EnvNumberPrompt } from "../src/prompts/EnvNumberPrompt";

const prompt = new EnvNumberPrompt(
  {
    type: "number",
    required: true,
    description: "Server port number",
    default: 8080,
  },
  {
    key: "PORT",
  }
);

const result = await prompt.prompt();
console.log("PORT=", result);