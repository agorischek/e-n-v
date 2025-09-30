import { EnvVarSource } from "./EnvVarSource.ts";

export function source(filePath: string): EnvVarSource {
  return new EnvVarSource(filePath);
}
