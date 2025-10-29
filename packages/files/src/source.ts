import { EnvSource } from "./EnvSource.ts";

export function source(filePath: string): EnvSource {
  return new EnvSource(filePath);
}
