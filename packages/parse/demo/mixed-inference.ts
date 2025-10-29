import { parse, s } from "../src";
import { define } from "@e-n-v/models";
import { z } from "zod";
import Joi from "joi";

const model = define({
  schemas: {
    BUILTIN_TIMEOUT: s.number({ default: 30 }),
    ZOD_MODE: z.enum(["development", "production"]),
    JOI_REGION: Joi.string<"us-east-1" | "eu-west-1">().valid(
      "us-east-1",
      "eu-west-1",
    ),
    BUILTIN_SECRET: s.string(),
    ZOD_DEBUG: z.boolean().default(false),
    JOI_FLAG: Joi.boolean().default(true),
  },
  preprocess: true,
});

const env = parse(
  {
    BUILTIN_TIMEOUT: "45",
    ZOD_MODE: "development",
    JOI_REGION: "eu-west-1",
    BUILTIN_SECRET: "shh-this-is-secret",
    ZOD_DEBUG: "true",
    JOI_FLAG: "false",
  },
  model,
);

void (env satisfies {
  BUILTIN_TIMEOUT: number;
  ZOD_MODE: "development" | "production";
  JOI_REGION: "us-east-1" | "eu-west-1";
  BUILTIN_SECRET: string;
  ZOD_DEBUG: boolean;
  JOI_FLAG: boolean;
});

console.log("✅ Mixed schemas inferred types:", env);
