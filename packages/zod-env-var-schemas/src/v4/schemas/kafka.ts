import { z } from "zod";
import { descriptions, messages } from "../../shared/infrastructure";
import { HOST_PORT_LIST_PATTERN } from "../../shared/patterns";

export const kafkaBrokers = () =>
  z
    .string()
    .describe(descriptions.kafkaBrokers)
    .regex(HOST_PORT_LIST_PATTERN, {
      message: messages.hostPortListFormat,
    });

export const kafkaClientId = () =>
  z
    .string()
    .describe(descriptions.kafkaClientId)
    .min(1, { message: messages.kafkaClientIdRequired });

export const KAFKA_BROKERS = kafkaBrokers();
export const KAFKA_CLIENT_ID = kafkaClientId();