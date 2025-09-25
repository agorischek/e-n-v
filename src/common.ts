import color from "picocolors";
import { Prompt } from "@clack/core";

// Clack symbols
export const S_BAR = "│";
export const S_BAR_END = "└";
export const S_STEP_ACTIVE = "◇";
export const S_STEP_SUBMIT = "◆";
export const S_STEP_CANCEL = "✕";

// Get the appropriate symbol based on prompt state
export function symbol(state: "initial" | "active" | "submit" | "cancel" | "error") {
  switch (state) {
    case "initial":
    case "active":
    case "error":
      return color.cyan(S_STEP_ACTIVE);
    case "submit":
      return color.green(S_STEP_SUBMIT);
    case "cancel":
      return color.red(S_STEP_CANCEL);
    default:
      return color.cyan(S_STEP_ACTIVE);
  }
}

export interface CommonOptions {
  output?: NodeJS.WritableStream;
  signal?: AbortSignal;
  input?: NodeJS.ReadableStream;
}