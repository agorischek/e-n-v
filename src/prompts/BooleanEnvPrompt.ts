import { Prompt, isCancel } from "@clack/core";
import type { Key } from "node:readline";
import color from "picocolors";
import { EnvPromptOptions } from "../EnvPromptOptions";
import { SKIP_SYMBOL } from "../symbols";

type Action = "up" | "down" | "left" | "right" | "space" | "enter" | "cancel";

interface BooleanEnvPromptOptions extends EnvPromptOptions<boolean> {}

export class BooleanEnvPrompt extends Prompt<boolean> {
  cursor = 0;
  protected options: BooleanEnvPromptOptions;

  constructor(opts: BooleanEnvPromptOptions) {
    super(
      {
        ...opts,
        render: function (this: BooleanEnvPrompt) {
          if (this.state === "submit") {
            // Handle symbol values (like SKIP_SYMBOL) that can't be converted to string
            if (typeof this.value === "symbol") {
              // User skipped - show just the key in gray
              return `${color.gray(color.bold(opts.key))}`;
            }
            // User provided a value - show ENV_KEY=value format
            return `${color.bold(color.white(opts.key))}${color.gray(
              "="
            )}${color.white(this.value ? "true" : "false")}`;
          }

          let output = "";

          // Add header line with key in bold white and description in gray if provided
          output += color.bold(color.white(opts.key));
          if (opts.description) {
            output += ` ${color.gray(opts.description)}`;
          }
          output += "\n";

          // Create options array for true/false
          const options = [
            { value: true, label: "true" },
            { value: false, label: "false" },
          ];

          options.forEach((option, index) => {
            const isSelected = index === this.cursor;
            const circle = isSelected ? color.green("●") : color.dim("○");

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
              ? color.white(option.label)
              : color.gray(option.label);
            const suffix = isSelected ? color.gray(annotation) : "";
            output += `${circle} ${text}${suffix}\n`;
          });

          // Add validation output
          output += this.error ? color.yellow(this.error) : "";

          return output;
        },
        validate: (value) => {
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