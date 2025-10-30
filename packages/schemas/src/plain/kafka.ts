import { StringEnvVarSchema, type StringEnvVarSchemaInput } from "@e-n-v/core";
import { string, pattern, minLength } from "@e-n-v/core";
import { attributes, descriptions, patterns } from "../shared/infrastructure";

export const kafkaBrokers = (input: Partial<StringEnvVarSchemaInput> = {}) =>
  new StringEnvVarSchema({
    description: descriptions.kafkaBrokers,
    process: string(
      pattern(patterns.hostPortList, attributes.hostPortListFormat)
    ),
    ...input,
  });

export const kafkaClientId = (input: Partial<StringEnvVarSchemaInput> = {}) =>
  new StringEnvVarSchema({
    description: descriptions.kafkaClientId,
    process: string(minLength(1, attributes.kafkaClientIdRequired)),
    ...input,
  });

export const KAFKA_BROKERS = kafkaBrokers();
export const KAFKA_CLIENT_ID = kafkaClientId();

