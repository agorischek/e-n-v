import { z } from "zod";
import { INFRASTRUCTURE_DESCRIPTIONS, INFRASTRUCTURE_MESSAGES } from "../../../shared/infrastructure";

const schema = z
  .string()
  .describe(INFRASTRUCTURE_DESCRIPTIONS.DOCKER_REGISTRY_URL)
  .url({ error: INFRASTRUCTURE_MESSAGES.DOCKER_REGISTRY_URL_FORMAT });

export const dockerRegistryUrlSchema = schema;
export const DOCKER_REGISTRY_URL = dockerRegistryUrlSchema;
