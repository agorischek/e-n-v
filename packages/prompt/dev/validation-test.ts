import Joi from "joi";
import { prompt } from "../src";

console.log("🧪 Validation Test\n");

// Simple port test
const portSchema = Joi.number()
  .integer()
  .min(1024)
  .max(65535)
  .default(3000)
  .description("Server port");

console.log("Testing port validation with invalid value '2'...\n");

await prompt({
  schemas: {
    PORT: portSchema,
  },
});
