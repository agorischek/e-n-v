import { parse } from "../src";
import { define } from "@e-n-v/models";
import Joi from "joi";

const model = define({
  schemas: {
    SERVICE_NAME: Joi.string().required(),
    SERVICE_PORT: Joi.number().integer().min(3000).max(9000).required(),
    ENABLE_METRICS: Joi.boolean().default(true),
    REGION: Joi.string<"us-east-1" | "us-west-2" | "eu-central-1">().valid(
      "us-east-1",
      "us-west-2",
      "eu-central-1",
    ),
  },
  preprocess: true,
});

const env = parse(
  {
    SERVICE_NAME: "envcredible-api",
    SERVICE_PORT: "4001",
    ENABLE_METRICS: "false",
    REGION: "us-east-1",
  },
  model,
);

// void (env satisfies {
//   SERVICE_NAME: string;
//   SERVICE_PORT: number;
//   ENABLE_METRICS: boolean;
//   REGION: "us-east-1" | "us-west-2" | "eu-central-1";
// });

console.log("✅ Joi schemas inferred types:", {
  serviceName: env.SERVICE_NAME,
  servicePort: env.SERVICE_PORT,
  enableMetrics: env.ENABLE_METRICS,
  region: env.REGION,
});
