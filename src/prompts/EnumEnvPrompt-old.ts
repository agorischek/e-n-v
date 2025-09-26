import { Prompt, isCancel } from "@clack/core";
import type { Key } from "node:readline";
import color from "picocolors";
import { EnvPromptOptions, defaultThemeColor } from "../EnvPromptOptions";
import { SKIP_SYMBOL, S_STEP_ACTIVE, S_STEP_SUBMIT, S_BAR, S_BAR_END, S_RADIO_ACTIVE, S_RADIO_INACTIVE } from "../symbols";
import { symbol } from "../symbolUtils";

type Action = "up" | "down" | "left" | "right" | "space" | "enter" | "cancel";

interface EnumEnvPromptOptions extends EnvPromptOptions<string> {
  options: string[];
}

export class EnumEnvPrompt extends Prompt<string> {
  cursor = 0;
  protected options: EnumEnvPromptOptions;

  constructor(opts: EnumEnvPromptOptions) {
    super(
      {
        ...opts,
        render: function (this: EnumEnvPrompt) {
          const themeColor = opts.themeColor || defaultThemeColor;
          
          // Helper function to get bar color based on error state
          const getBarColor = (barSymbol: string) => {
            return this.state === "error" ? color.yellow(barSymbol) : themeColor(barSymbol);
          };
          
          if (this.state === "submit") {
            // Handle symbol values (like SKIP_SYMBOL) that can't be converted to string
            if (typeof this.value === "symbol") {
              // User skipped - show just the key in gray with hollow diamond
              return `${themeColor(S_STEP_ACTIVE)}  ${color.gray(color.bold(opts.key))}`;
            }
            // User provided a value - show ENV_KEY=value format with hollow diamond
            return `${themeColor(S_STEP_ACTIVE)}  ${color.bold(color.white(opts.key))}${color.gray(
              "="
            )}${color.white(this.value)}`;
          }

          let output = "";

          // Add header line with symbol based on state and key in bold white and description in gray if provided
          output += `${symbol(this.state, themeColor)}  ${color.bold(color.white(opts.key))}`;
          if (opts.description) {
            output += ` ${color.gray(opts.description)}`;
          }
          output += "\n";

          // Display enum options
          opts.options.forEach((option, index) => {
            const isSelected = index === this.cursor;
            const circle = isSelected ? themeColor(S_RADIO_ACTIVE) : color.dim(S_RADIO_INACTIVE);

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
              ? color.white(option)
              : color.gray(option);
            const suffix = isSelected ? color.gray(annotation) : "";
            output += `${getBarColor(S_BAR)}  ${circle} ${text}${suffix}\n`;
          });

          // Add validation output with L-shaped pipe
          if (this.error) {
            output += `${getBarColor(S_BAR_END)}  ${color.yellow(this.error)}`;
          } else {
            output += `${getBarColor(S_BAR_END)}`;
          }

          return output;
        },
        validate: (value) => {
          // For enum prompts, validate with custom validation if provided
          if (this.options.validate && typeof this.value !== 'symbol') {
            const customValidation = this.options.validate(this.value);
            if (customValidation) {
              return customValidation instanceof Error ? customValidation.message : customValidation;
            }
          }
          return undefined;
        },
      },
      false
    );

    this.options = opts;

    // Set initial value to current, or default, or first option
    this.value = this.options.current ?? this.options.default ?? this.options.options[0];
    
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
          this.cursor = this.cursor === 0 ? this.options.options.length - 1 : this.cursor - 1;
          break;
        case "down":
          this.cursor = this.cursor === this.options.options.length - 1 ? 0 : this.cursor + 1;
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