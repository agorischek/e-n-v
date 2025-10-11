import { z } from "zod";
import { INFRASTRUCTURE_DESCRIPTIONS } from "../../../shared/infrastructure";

const schema = z
  .string()
  .describe(INFRASTRUCTURE_DESCRIPTIONS.DOCKER_REGISTRY_USERNAME)
  .optional();

export const dockerRegistryUsernameSchema = schema;
export const DOCKER_REGISTRY_USERNAME = dockerRegistryUsernameSchema;
