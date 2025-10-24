import {
  StringEnvVarSchema,
  type StringEnvVarSchemaInput,
} from "../../../envcredible-core/src";
import { createZodProcessor } from "../helpers/createZodProcesor";
import { z } from "zod";
import { descriptions, messages, patterns } from "../shared/infrastructure";

export const rabbitmqUrl = (input: Partial<StringEnvVarSchemaInput> = {}) =>
  new StringEnvVarSchema({
    description: descriptions.rabbitmqUrl,
    process: createZodProcessor(
      z.string().regex(patterns.rabbitmqUrl, {
        message: messages.rabbitmqUrlFormat,
      }),
    ),
    secret: true,
    ...input,
  });

export const RABBITMQ_URL = rabbitmqUrl();

export const rabbitmq = {
  RABBITMQ_URL,
} as const;
