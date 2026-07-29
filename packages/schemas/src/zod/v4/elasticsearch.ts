import { descriptions, messages } from "../../shared/infrastructure";
import { patterns } from "../../shared/apiService";
import type { ZodSingleton } from "./types";

export const elasticsearchUrl = (z: ZodSingleton) =>
  z
    .url({ message: messages.elasticsearchUrlFormat })
    .describe(descriptions.elasticsearchUrl)
    .regex(patterns.httpProtocol, {
      message: messages.elasticsearchUrlProtocol,
    });

export const elasticsearchUsername = (z: ZodSingleton) =>
  z.string().describe(descriptions.elasticsearchUsername).optional();

export const elasticsearchPassword = (z: ZodSingleton) =>
  z.string().describe(descriptions.elasticsearchPassword).optional();
