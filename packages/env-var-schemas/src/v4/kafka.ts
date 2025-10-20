import { z } from "zod";
import { descriptions, messages } from "../shared/infrastructure";
import { patterns } from "../shared/infrastructure";

export const kafkaBrokers = () =>
  z.string().describe(descriptions.kafkaBrokers).regex(patterns.hostPortList, {
    message: messages.hostPortListFormat,
  });

export const kafkaClientId = () =>
  z
    .string()
    .describe(descriptions.kafkaClientId)
    .min(1, { message: messages.kafkaClientIdRequired });

export const KAFKA_BROKERS = kafkaBrokers();
export const KAFKA_CLIENT_ID = kafkaClientId();
