import { z } from "zod";
import { patterns } from "../../shared/apiService";
import { descriptions, messages } from "../../shared/apiService";

const webhookUrl = () =>
  z
    .url({ message: messages.mustBeValidUrl })
    .describe(descriptions.webhookUrl)
    .regex(patterns.httpsProtocol, { error: messages.httpsProtocolRequired });

export const WEBHOOK_URL = webhookUrl();
