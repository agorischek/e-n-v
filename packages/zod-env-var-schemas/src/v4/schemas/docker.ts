import { z } from "zod";
import { descriptions, messages } from "../../shared/infrastructure";

export const dockerRegistryUrl = () =>
  z
    .string()
    .url({ message: messages.dockerRegistryUrlFormat })
    .describe(descriptions.dockerRegistryUrl);

export const dockerRegistryUsername = () =>
  z
    .string()
    .describe(descriptions.dockerRegistryUsername)
    .optional();

export const dockerRegistryPassword = () =>
  z
    .string()
    .describe(descriptions.dockerRegistryPassword)
    .optional();

export const DOCKER_REGISTRY_URL = dockerRegistryUrl();
export const DOCKER_REGISTRY_USERNAME = dockerRegistryUsername();
export const DOCKER_REGISTRY_PASSWORD = dockerRegistryPassword();
