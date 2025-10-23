import { StringEnvVarSchema, type StringEnvVarSchemaInput } from "../../../envcredible-core/src";
import { createZodProcessor } from "../helpers/zodHelpers";
import { z } from "zod";
import { descriptions, messages, patterns } from "../shared/infrastructure";

export const kafkaBrokers = (input: Partial<StringEnvVarSchemaInput> = {}) =>
  new StringEnvVarSchema({
    description: descriptions.kafkaBrokers,
    process: createZodProcessor(
      z.string().regex(patterns.hostPortList, {
        message: messages.hostPortListFormat,
      }),
    ),
    ...input,
  });

export const kafkaClientId = (input: Partial<StringEnvVarSchemaInput> = {}) =>
  new StringEnvVarSchema({
    description: descriptions.kafkaClientId,
    process: createZodProcessor(
      z.string().min(1, { message: messages.kafkaClientIdRequired }),
    ),
    ...input,
  });

export const KAFKA_BROKERS = kafkaBrokers();
export const KAFKA_CLIENT_ID = kafkaClientId();

export const kafka = {
  KAFKA_BROKERS,
  KAFKA_CLIENT_ID,
} as const;