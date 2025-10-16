import { EnvNumberPrompt } from "../src/prompts/EnvNumberPrompt";

const prompt = new EnvNumberPrompt(
  {
    type: "number",
    required: true,
    nullable: false,
    description: "API server port (must be between 1024-65535)",
    defaultValue: 8080,
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
    },
  },
  {
    key: "API_PORT",
    current: 3000,
    default: 8080,
  }
);

const result = await prompt.prompt();
console.log("API_PORT=", result);