import color from "picocolors";
import { S_STEP_ACTIVE, S_STEP_SUBMIT, S_STEP_CANCEL, S_STEP_ERROR } from "./symbols";
import { defaultThemeColor } from "./EnvPromptOptions";

/**
 * Get the appropriate symbol based on prompt state
 * @param state The current state of the prompt
 * @param themeColor Optional theme color function, defaults to defaultThemeColor
 * @returns The colored symbol for the given state
 */
export function symbol(
  state: "initial" | "active" | "submit" | "cancel" | "error",
  themeColor = defaultThemeColor
) {
  switch (state) {
    case "initial":
    case "active":
      return themeColor(S_STEP_ACTIVE);
    case "error":
      return color.yellow(S_STEP_ERROR);
    case "submit":
      return themeColor(S_STEP_SUBMIT);
    case "cancel":
      return color.red(S_STEP_CANCEL);
    default:
      return themeColor(S_STEP_ACTIVE);
  }
}
