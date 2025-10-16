import { EnvNumberPrompt } from "../src/prompts/EnvNumberPrompt";

const prompt = new EnvNumberPrompt(
  {
    type: "number",
    required: true,
    nullable: false,
    description: "Server port number",
    defaultValue: 8080,
  },
  {
    key: "PORT",
    current: 3000,
    default: 8080,
  }
);

const result = await prompt.prompt();
console.log("PORT=", result);