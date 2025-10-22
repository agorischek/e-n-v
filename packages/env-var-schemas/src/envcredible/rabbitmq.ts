import { StringEnvVarSchema, type StringEnvVarSchemaInput } from "../../../envcredible-core/src";
import { processWithZodSchema } from "@envcredible/converters";
import { z } from "zod";
import { descriptions, messages, patterns } from "../shared/infrastructure";

export const rabbitmqUrl = (input: Partial<StringEnvVarSchemaInput> = {}) =>
  new StringEnvVarSchema({
    description: descriptions.rabbitmqUrl,
    process: processWithZodSchema<string>(
      z.string().regex(patterns.rabbitmqUrl, {
        message: messages.rabbitmqUrlFormat,
      }),
      "string"
    ),
    secret: true,
    ...input,
  });

export const RABBITMQ_URL = rabbitmqUrl();

export const rabbitmq = {
  RABBITMQ_URL,
} as const;