import * as color from "picocolors";
import type { Theme } from "./Theme";
import { S_BAR_START } from "./symbols";
import { Writable } from "node:stream";

export function renderSetupHeader(
  output: Writable,
  theme: Theme,
  displayEnvPath: string,
): void {
  const headerBody = [
    theme.bgPrimary(color.black(" Environment Variable Setup ")),
    `${color.gray("│")}  ${color.gray(displayEnvPath)}`,
    `${color.gray("│")}  `,
  ].join("\n");

  output.write(`\n${color.gray(S_BAR_START)}  ${headerBody}\n`);
}
