import { EnvNumberPrompt } from "../src/prompts/EnvNumberPrompt";

const prompt = new EnvNumberPrompt({
  key: "API_PORT",
  description: "API server port (must be between 1024-65535)",
  current: 3000,
  default: 8080,
  required: true,
  validate: (value) => {
    if (value === undefined) {
      return "Port is required";
    }
    if (value < 1024) {
      return "Port must be >= 1024 (reserved ports)";
    }
    if (value > 65535) {
      return "Port must be <= 65535 (max port number)";
    }
    return undefined;
  }
});

const result = await prompt.prompt();
console.log("API_PORT=", result);