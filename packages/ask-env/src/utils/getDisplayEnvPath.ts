import { relative } from "node:path";

export function getDisplayEnvPath(envPath: string, cwd: string = process.cwd()): string {
  const relativeEnvPath = relative(cwd, envPath);

  if (relativeEnvPath === "") {
    return ".";
  }

  if (relativeEnvPath.startsWith(".")) {
    return relativeEnvPath;
  }

  return `./${relativeEnvPath}`;
}
