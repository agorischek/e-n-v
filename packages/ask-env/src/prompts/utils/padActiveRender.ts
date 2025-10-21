import type { EnvPrompt } from "../EnvPrompt";

export type PromptRender<TPrompt extends EnvPrompt<any, any>> = (
  this: TPrompt,
) => string | undefined;

/**
 * Ensures active prompts leave a blank line beneath their output while leaving
 * submitted or cancelled renders untouched.
 */
export function padActiveRender<TPrompt extends EnvPrompt<any, any>>(
  render: PromptRender<TPrompt>,
): PromptRender<TPrompt> {
  return function paddedRender(this: TPrompt) {
    const result = render.call(this);
    if (typeof result !== "string") {
      return result;
    }

    if (this.state === "submit" || this.state === "cancel") {
      return result;
    }

    const normalized = result.replace(/\r\n/g, "\n");
    if (!normalized) {
      return "\n";
    }

    if (normalized.endsWith("\n")) {
      return result;
    }

    return result + "\n";
  };
}
