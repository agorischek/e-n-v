import color from "picocolors";
import { Prompt } from "@clack/core";
import { S_BAR, S_BAR_END } from "./visuals/symbols";
import { symbol as symbolWithTheme } from "./symbolUtils";

// Re-export symbol function with the original color scheme for backward compatibility
export const symbol = (state: "initial" | "active" | "submit" | "cancel" | "error") => {
  switch (state) {
    case "submit":
      return symbolWithTheme(state, color.green);
    default:
      return symbolWithTheme(state, color.cyan);
  }
};

export interface CommonOptions {
  output?: NodeJS.WritableStream;
  signal?: AbortSignal;
  input?: NodeJS.ReadableStream;
}