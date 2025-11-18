import { defaults, descriptions } from "../../shared/apiService";
import type { ZodSingleton } from "./types";

export const hostSchema = (z: ZodSingleton) =>
  z.string().describe(descriptions.host).default(defaults.host);
