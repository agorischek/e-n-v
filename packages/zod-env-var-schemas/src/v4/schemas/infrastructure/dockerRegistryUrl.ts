import { z } from "zod";
import { INFRASTRUCTURE_DESCRIPTIONS, INFRASTRUCTURE_MESSAGES } from "../../../shared/infrastructure";

const schema = z
  .url({ message: INFRASTRUCTURE_MESSAGES.DOCKER_REGISTRY_URL_FORMAT })
  .describe(INFRASTRUCTURE_DESCRIPTIONS.DOCKER_REGISTRY_URL);

export const dockerRegistryUrlSchema = schema;
export const DOCKER_REGISTRY_URL = dockerRegistryUrlSchema;
