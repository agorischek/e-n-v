import { fileURLToPath } from "bun";
import { dirname } from "desm";
import { Theme } from "../visuals/Theme";
import type { AskEnvOptions } from "./AskEnvOptions";
import color from "picocolors";
import { resolve as resolvePath } from "node:path";

export function resolveTheme(themeOption: AskEnvOptions["theme"]): Theme {
  return new Theme(themeOption ?? color.magenta);
}

export function resolveRootDirectory(
  rootOption: AskEnvOptions["root"],
): string | undefined {
  if (!rootOption) {
    return undefined;
  }

  if (rootOption.startsWith("file://")) {
    return dirname(fileURLToPath(rootOption));
  }

  return rootOption;
}

export function resolveEnvFilePath(
  pathOption: string,
  rootDir: string | undefined,
): string {
  if (!rootDir) {
    return pathOption;
  }

  return resolvePath(rootDir, pathOption);
}

export default {
  theme: resolveTheme,
  rootDirectory: resolveRootDirectory,
  envFilePath: resolveEnvFilePath,
};
