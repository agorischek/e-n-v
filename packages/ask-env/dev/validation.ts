import { EnvNumberPrompt } from "../src/prompts/EnvNumberPrompt";
import { processors } from "@envcredible/core";

const prompt = new EnvNumberPrompt(
  {
    type: "number",
    required: true,
    description: "API server port (must be between 1024-65535)",
    default: 8080,
    process: processors.number(),
  },
  {
    key: "API_PORT",
    current: 3000,
  },
);

const result = await prompt.prompt();
console.log("API_PORT=", result);
