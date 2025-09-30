import { EnvSource } from "../env-var-source/index.ts";

export function source(filePath: string): EnvSource {
  return new EnvSource(filePath);
}
