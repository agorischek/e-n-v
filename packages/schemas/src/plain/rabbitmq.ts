import { StringEnvVarSchema, type StringEnvVarSchemaInput } from "@e-n-v/core";
import { string, pattern } from "@e-n-v/core";
import { attributes, descriptions, patterns } from "../shared/infrastructure";

export const rabbitmqUrl = (input: Partial<StringEnvVarSchemaInput> = {}) =>
  new StringEnvVarSchema({
    description: descriptions.rabbitmqUrl,
    process: string(
      pattern(patterns.rabbitmqUrl, attributes.rabbitmqUrlFormat)
    ),
    secret: true,
    ...input,
  });

export const RABBITMQ_URL = rabbitmqUrl();
