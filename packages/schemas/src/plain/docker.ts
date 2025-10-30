import { StringEnvVarSchema, type StringEnvVarSchemaInput } from "@e-n-v/core";
import { string, url } from "../helpers/validators";
import { attributes, descriptions } from "../shared/infrastructure";

export const dockerRegistryUrl = (
  input: Partial<StringEnvVarSchemaInput> = {},
) =>
  new StringEnvVarSchema({
    description: descriptions.dockerRegistryUrl,
    process: string(url(attributes.dockerRegistryUrlFormat)),
    ...input,
  });

export const dockerRegistryUsername = (
  input: Partial<StringEnvVarSchemaInput> = {},
) =>
  new StringEnvVarSchema({
    description: descriptions.dockerRegistryUsername,
    process: string(),
    required: false,
    ...input,
  });

export const dockerRegistryPassword = (
  input: Partial<StringEnvVarSchemaInput> = {},
) =>
  new StringEnvVarSchema({
    description: descriptions.dockerRegistryPassword,
    process: string(),
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
