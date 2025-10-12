import { z } from "zod";
import { descriptions, messages } from "../../shared/apiService";

const schema = z
  .url({ message: messages.mustBeValidUrl })
  .describe(descriptions.serviceUrl);

export const serviceUrl = () => schema;
export const serviceUrlSchema = schema;
export const SERVICE_URL = serviceUrlSchema;
