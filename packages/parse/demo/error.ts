import { parse, define } from "../src/index";
import { z } from "zod";

const env = {
  PORT: "not-a-number",
  DEBUG: "maybe",
};

const model = define({
  schemas: {
    PORT: z.number(),
    DEBUG: z.boolean(),
    REQUIRED_KEY1: z.string(),
    REQUIRED_KEY2: z.number(),
  },
});

parse(env, model);
