import { EnvPrompt, EnvPromptOptions } from "./EnvPrompt";
import {
  SKIP_SYMBOL,
  S_RADIO_ACTIVE,
  S_RADIO_INACTIVE,
} from "../visuals/symbols";
import type { Key } from "node:readline";
import { Theme } from "../visuals/Theme";

type Action = "up" | "down" | "left" | "right" | "space" | "enter" | "cancel";

interface EnvEnumPromptOptions extends EnvPromptOptions<string> {
  options: string[];
}

export class EnvEnumPrompt extends EnvPrompt<string> {
  cursor = 0;
  protected options: EnvEnumPromptOptions;

  constructor(opts: EnvEnumPromptOptions) {
    super(
      {
        ...opts,
        theme: opts.theme || Theme.default,
        render: function (this: EnvEnumPrompt) {
          if (this.state === "submit") {
            // Handle symbol values (like SKIP_SYMBOL) that can't be converted to string
            if (typeof this.value === "symbol") {
              // User skipped - show just the key in gray with hollow diamond
              return `${this.getSymbol()}  ${this.colors.subtle(this.colors.bold(opts.key))}`;
            }
            // User provided a value - show ENV_KEY=value format with hollow diamond
            return `${this.getSymbol()}  ${this.colors.bold(
              this.colors.white(opts.key)
            )}${this.colors.subtle("=")}${this.colors.white(this.value)}`;
          }

          let output = "";

          // Add header line with symbol based on state and key in bold white and description in gray if provided
          output += `${this.getSymbol()}  ${this.colors.bold(
            this.colors.white(opts.key)
          )}`;
          if (opts.description) {
            output += ` ${this.colors.subtle(opts.description)}`;
          }
          output += "\n";

          // Display enum options
          opts.options.forEach((option, index) => {
            const isSelected = index === this.cursor;
            const circle = isSelected
              ? this.theme.primary(S_RADIO_ACTIVE)
              : this.colors.dim(S_RADIO_INACTIVE);

            // Determine if this option matches current or default
            let annotation = "";
            if (opts.current === option && opts.default === option) {
              annotation = " (current, default)";
            } else if (opts.current === option) {
              annotation = " (current)";
            } else if (opts.default === option) {
              annotation = " (default)";
            }

            const text = isSelected
              ? this.colors.white(option)
              : this.colors.subtle(option);
            const suffix = isSelected ? this.colors.subtle(annotation) : "";
            output += `${this.getBar()}  ${circle} ${text}${suffix}\n`;
          });

          // Add validation output with L-shaped pipe
          if (this.error) {
            output += `${this.getBarEnd()}  ${this.colors.warn(this.error)}`;
          } else {
            output += `${this.getBarEnd()}`;
          }

          return output;
        },
        validate: (value: string | symbol) => {
          // For enum prompts, validate with custom validation if provided
          if (this.options.validate && typeof this.value !== "symbol") {
            const customValidation = this.options.validate(this.value);
            if (customValidation) {
              return customValidation instanceof Error
                ? customValidation.message
                : customValidation;
            }
          }
          return undefined;
        },
      },
      false
    );

    this.options = opts;

    // Set initial value to current, or default, or first option
    this.value =
      this.options.current ?? this.options.default ?? this.options.options[0];

    // Set initial cursor position based on current/default value
    const initialIndex = this.options.current
      ? this.options.options.indexOf(this.options.current)
      : this.options.default
      ? this.options.options.indexOf(this.options.default)
      : 0;
    this.cursor = Math.max(0, initialIndex);

    this.on("cursor", (action?: Action) => {
      // Clear error state when user navigates (like base Prompt class does)
      if (this.state === "error") {
        this.state = "active";
        this.error = "";
      }

      switch (action) {
        case "up":
          this.cursor =
            this.cursor === 0
              ? this.options.options.length - 1
              : this.cursor - 1;
          break;
        case "down":
          this.cursor =
            this.cursor === this.options.options.length - 1
              ? 0
              : this.cursor + 1;
          break;
      }
      this.updateValue();
    });

    this.on("key", (char: string | undefined, info: Key) => {
      if (!info) return; // Guard against undefined info

      // Clear error state when user types (like base Prompt class does)
      if (this.state === "error") {
        this.state = "active";
        this.error = "";
      }

      // Handle tab key specifically - return SKIP_SYMBOL immediately
      if (info.name === "tab") {
        this.value = SKIP_SYMBOL as any;
        this.state = "submit";
        return;
      }
    });
  }

  private updateValue() {
    this.value = this.options.options[this.cursor];
  }
}
