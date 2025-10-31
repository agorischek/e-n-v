import { patterns } from "../../shared/apiService";
import { descriptions, messages } from "../../shared/apiService";
import type { ZodSingleton } from "./types";

export const webhookUrl = (z: ZodSingleton) =>
  z
    .url({ message: messages.mustBeValidUrl })
    .describe(descriptions.webhookUrl)
    .regex(patterns.httpsProtocol, { error: messages.httpsProtocolRequired });
