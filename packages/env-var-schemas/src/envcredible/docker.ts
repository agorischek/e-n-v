import {
  StringEnvVarSchema,
  type StringEnvVarSchemaInput,
} from "../../../envcredible-core/src";
import { createZodProcessor } from "../helpers/createZodProcesor";
import { z } from "zod";
import { descriptions, messages } from "../shared/infrastructure";

export const dockerRegistryUrl = (
  input: Partial<StringEnvVarSchemaInput> = {},
) =>
  new StringEnvVarSchema({
    description: descriptions.dockerRegistryUrl,
    process: createZodProcessor(
      z.string().url({ message: messages.dockerRegistryUrlFormat }),
    ),
    ...input,
  });

export const dockerRegistryUsername = (
  input: Partial<StringEnvVarSchemaInput> = {},
) =>
  new StringEnvVarSchema({
    description: descriptions.dockerRegistryUsername,
    process: createZodProcessor(z.string()),
    required: false,
    ...input,
  });

export const dockerRegistryPassword = (
  input: Partial<StringEnvVarSchemaInput> = {},
) =>
  new StringEnvVarSchema({
    description: descriptions.dockerRegistryPassword,
    process: createZodProcessor(z.string()),
    secret: true,
    required: false,
    ...input,
  });

export const DOCKER_REGISTRY_URL = dockerRegistryUrl();
export const DOCKER_REGISTRY_USERNAME = dockerRegistryUsername();
export const DOCKER_REGISTRY_PASSWORD = dockerRegistryPassword();

export const docker = {
  DOCKER_REGISTRY_URL,
  DOCKER_REGISTRY_USERNAME,
  DOCKER_REGISTRY_PASSWORD,
} as const;
