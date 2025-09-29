
import { EnvSource } from "./EnvSource";

export const source = (filePath: string) => new EnvSource(filePath);

export { EnvSource };