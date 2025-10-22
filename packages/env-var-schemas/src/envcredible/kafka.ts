import { StringEnvVarSchema, type StringEnvVarSchemaInput } from "../../../envcredible-core/src";
import { processWithZodSchema } from "@envcredible/converters";
import { z } from "zod";
import { descriptions, messages, patterns } from "../shared/infrastructure";

export const kafkaBrokers = (input: Partial<StringEnvVarSchemaInput> = {}) =>
  new StringEnvVarSchema({
    description: descriptions.kafkaBrokers,
    process: processWithZodSchema<string>(
      z.string().regex(patterns.hostPortList, {
        message: messages.hostPortListFormat,
      }),
      "string"
    ),
    ...input,
  });

export const kafkaClientId = (input: Partial<StringEnvVarSchemaInput> = {}) =>
  new StringEnvVarSchema({
    description: descriptions.kafkaClientId,
    process: processWithZodSchema<string>(
      z.string().min(1, { message: messages.kafkaClientIdRequired }),
      "string"
    ),
    ...input,
  });

export const KAFKA_BROKERS = kafkaBrokers();
export const KAFKA_CLIENT_ID = kafkaClientId();

export const kafka = {
  KAFKA_BROKERS,
  KAFKA_CLIENT_ID,
} as const;