import { z } from "zod";import { z } from "zod";import { z } from "zod";

import { askEnv } from "./src/index";

import { askEnv } from "./src/index";import { askEnv } from "./src/index";

const schemas = {

  FIRST_VAR: z.string(),

  SECOND_VAR: z.number(),  

  THIRD_VAR: z.boolean(),const schemas = {const schemas = {

};

  FIRST_VAR: z.string(),  FIRST_VAR: z.string(),

console.log("Testing cancellation - press Ctrl+C on FIRST_VAR to test:");

  SECOND_VAR: z.number(),    SECOND_VAR: z.number(),

askEnv(schemas, { envPath: ".env.test" }).catch(console.error);
  THIRD_VAR: z.boolean(),  THIRD_VAR: z.boolean(),

};};



console.log("Testing cancellation - press Ctrl+C on FIRST_VAR to test:");console.log("Testing cancellation behavior:");

console.log("1. Start the prompt");

askEnv(schemas, { envPath: ".env.test" }).catch(console.error);console.log("2. Press Ctrl+C on the first prompt");
console.log("3. Verify it exits completely without asking for SECOND_VAR or THIRD_VAR");
console.log("");

// Test the askEnv function
askEnv(schemas, { envPath: ".env.test" }).catch(console.error);