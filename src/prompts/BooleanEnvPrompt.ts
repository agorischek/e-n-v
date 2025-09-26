import { ThemedPrompt } from "../ThemedPrompt";
import { EnvPromptOptions, defaultTheme } from "../EnvPromptOptions";
import { SKIP_SYMBOL, S_STEP_ACTIVE, S_RADIO_ACTIVE, S_RADIO_INACTIVE } from "../symbols";
import { symbol } from "../symbolUtils";
import type { Key } from "node:readline";

type Action = "up" | "down" | "left" | "right" | "space" | "enter" | "cancel";

interface BooleanEnvPromptOptions extends EnvPromptOptions<boolean> {}

export class BooleanEnvPrompt extends ThemedPrompt<boolean> {
  cursor = 0;
  protected options: BooleanEnvPromptOptions;

  constructor(opts: BooleanEnvPromptOptions) {
    super(
      {
        ...opts,
        theme: opts.theme || defaultTheme,
        render: function (this: BooleanEnvPrompt) {
          if (this.state === "submit") {
            // Handle symbol values (like SKIP_SYMBOL) that can't be converted to string
            if (typeof this.value === "symbol") {
              // User skipped - show just the key in gray with hollow diamond
              return `${this.theme.primary(S_STEP_ACTIVE)}  ${this.colors.subtle(this.colors.bold(opts.key))}`;
            }
            // User provided a value - show ENV_KEY=value format with hollow diamond
            return `${this.theme.primary(S_STEP_ACTIVE)}  ${this.colors.bold(this.colors.white(opts.key))}${this.colors.subtle(
              "="
            )}${this.colors.white(this.value ? "true" : "false")}`;
          }

          let output = "";

          // Add header line with symbol based on state and key in bold white and description in gray if provided
          output += `${this.getSymbol()}  ${this.colors.bold(this.colors.white(opts.key))}`;
          if (opts.description) {
            output += ` ${this.colors.subtle(opts.description)}`;
          }
          output += "\n";

          // Create options array for true/false
          const options = [
            { value: true, label: "true" },
            { value: false, label: "false" },
          ];

          options.forEach((option, index) => {
            const isSelected = index === this.cursor;
            const circle = isSelected ? this.theme.primary(S_RADIO_ACTIVE) : this.colors.dim(S_RADIO_INACTIVE);

            // Determine if this option matches current or default
            let annotation = "";
            if (opts.current === option.value && opts.default === option.value) {
              annotation = " (current, default)";
            } else if (opts.current === option.value) {
              annotation = " (current)";
            } else if (opts.default === option.value) {
              annotation = " (default)";
            }

            const text = isSelected
              ? this.colors.white(option.label)
              : this.colors.subtle(option.label);
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
        validate: (value: boolean | symbol) => {
          // For boolean prompts, always validate with custom validation if provided
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

    // Set initial value to current, or default, or false
    this.value = this.options.current ?? this.options.default ?? false;

    this.on("cursor", (action?: Action) => {
      // Clear error state when user navigates (like base Prompt class does)
      if (this.state === "error") {
        this.state = "active";
        this.error = "";
      }
      
      switch (action) {
        case "up":
          this.cursor = this.cursor === 0 ? 1 : 0;
          break;
        case "down":
          this.cursor = this.cursor === 1 ? 0 : 1;
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
    // cursor 0 = true, cursor 1 = false
    this.value = this.cursor === 0;
  }
}
