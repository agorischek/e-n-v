import { EnvVarSource } from "../env-var-source/index.ts";

export function source(filePath: string): EnvVarSource {
  return new EnvVarSource(filePath);
}
