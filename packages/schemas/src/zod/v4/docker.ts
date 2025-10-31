import { descriptions, messages } from "../../shared/infrastructure";
import type { ZodSingleton } from "./types";

export const dockerRegistryUrl = (z: ZodSingleton) =>
  z
    .string()
    .url({ message: messages.dockerRegistryUrlFormat })
    .describe(descriptions.dockerRegistryUrl);

export const dockerRegistryUsername = (z: ZodSingleton) =>
  z.string().describe(descriptions.dockerRegistryUsername).optional();

export const dockerRegistryPassword = (z: ZodSingleton) =>
  z.string().describe(descriptions.dockerRegistryPassword).optional();
