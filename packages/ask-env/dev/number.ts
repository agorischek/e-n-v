import { EnvNumberPrompt } from "../src/prompts/EnvNumberPrompt";
import { NumberEnvVarSchema } from "@envcredible/core";

const schema = new NumberEnvVarSchema({
  required: true,
  description: "Server port number",
  default: 8080,
});

const prompt = new EnvNumberPrompt(schema, {
  key: "PORT",
});

const result = await prompt.prompt();
console.log("PORT=", result);
