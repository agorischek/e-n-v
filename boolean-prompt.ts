import { SelectPrompt, isCancel } from "@clack/core";
import color from "picocolors";

interface BooleanPromptOptions {
  current?: boolean;
  default?: boolean;
  optional: boolean;
  description?: string;
  key: string;
}

type BooleanOption = {
  value: "true" | "false" | "skip";
  label: string;
};

export class BooleanPrompt extends SelectPrompt<BooleanOption> {
  private promptOptions: BooleanPromptOptions;

  constructor(opts: BooleanPromptOptions) {
    // Build the options array
    const options: BooleanOption[] = [
      { value: "true", label: "true" },
      { value: "false", label: "false" },
    ];

    // Add skip option if prompt is optional
    if (opts.optional) {
      options.push({ value: "skip", label: "skip" });
    }

    const initialValue = BooleanPrompt.getInitialValue(opts);

    super({
      render: function () {
        if (this.state === "submit") {
          const selectedValue = this.value as "true" | "false" | "skip";
          if (selectedValue === "skip") {
            return color.dim(`${opts.key}: skipped`);
          }
          const boolValue = selectedValue === "true";
          const valueColor = boolValue ? color.green : color.red;
          const icon = boolValue ? "✓" : "✗";
          return `${opts.key}: ${valueColor(icon + " " + boolValue)}`;
        }

        // Build the prompt display
        const title = BooleanPrompt.buildTitle(opts);
        const optionsList = BooleanPrompt.buildOptionsList(
          this.options,
          this.cursor
        );

        return `${title}\n${optionsList}`;
      },
      options,
      initialValue,
    });

    this.promptOptions = opts;
  }

  private static buildTitle(opts: BooleanPromptOptions): string {
    const { key, description } = opts;

    let title = color.cyan(`${key}`);
    if (description) {
      title += color.dim(` - ${description}`);
    }

    // Show current and default values
    const meta = BooleanPrompt.buildMetaInfo(opts);
    if (meta) {
      title += `\n${meta}`;
    }

    return title;
  }

  private static buildMetaInfo(opts: BooleanPromptOptions): string {
    const { current, default: defaultValue } = opts;
    const parts: string[] = [];

    if (current !== undefined) {
      const currentColor = current ? color.green : color.red;
      const currentIcon = current ? "✓" : "✗";
      parts.push(`current: ${currentColor(currentIcon + " " + current)}`);
    }

    if (defaultValue !== undefined) {
      const defaultColor = defaultValue ? color.green : color.red;
      const defaultIcon = defaultValue ? "✓" : "✗";
      parts.push(`default: ${defaultColor(defaultIcon + " " + defaultValue)}`);
    }

    if (parts.length > 0) {
      return color.dim(`(${parts.join(", ")})`);
    }

    return "";
  }

  private static buildOptionsList(
    options: BooleanOption[],
    cursor: number
  ): string {
    return options
      .map((option, index) => {
        const isSelected = index === cursor;
        // Use consistent 2-character padding to avoid bouncing
        const marker = isSelected ? color.cyan("▶ ") : "  ";

        let optionText: string;
        let icon: string;

        if (option.value === "skip") {
          // Skip option
          optionText = color.dim("skip");
          icon = color.dim("⏭");
        } else if (option.value === "true") {
          // True option
          optionText = isSelected ? color.white("true") : "true";
          icon = color.green("✓");
        } else {
          // False option
          optionText = isSelected ? color.white("false") : "false";
          icon = color.red("✗");
        }

        return `${marker}${icon} ${optionText}`;
      })
      .join("\n");
  }

  private static getInitialValue(
    opts: BooleanPromptOptions
  ): "true" | "false" | "skip" {
    // Prioritize current value, then default, then first option
    if (opts.current !== undefined) {
      return opts.current ? "true" : "false";
    }
    if (opts.default !== undefined) {
      return opts.default ? "true" : "false";
    }
    return "true"; // Default to true
  }
}

// Convenience function that converts the string result back to boolean/null
export async function booleanPrompt(
  opts: BooleanPromptOptions
): Promise<boolean | null | symbol> {
  const prompt = new BooleanPrompt(opts);
  const result = await prompt.prompt();

  if (isCancel(result)) {
    return result;
  }

  if (result === "skip") {
    return null;
  }

  return result === "true";
}

export { isCancel };
