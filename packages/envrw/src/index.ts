
import { EnvSource } from "./EnvSource";

export const source = (filePath: string) => new EnvSource(filePath);

export { EnvSource };
export type { EnvUnlisten } from "./EnvSource";
export { formatEnvContent, formatEnvFile } from "./formatEnv";