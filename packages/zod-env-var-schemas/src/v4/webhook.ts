import { z } from "zod";
import { HTTPS_PROTOCOL_PATTERN } from "../shared/patterns";
import { descriptions, messages } from "../shared/apiService";

const webhookUrl = () =>
  z
    .url({ message: messages.mustBeValidUrl })
    .describe(descriptions.webhookUrl)
    .regex(HTTPS_PROTOCOL_PATTERN, { error: messages.httpsProtocolRequired });

export const WEBHOOK_URL = webhookUrl();
