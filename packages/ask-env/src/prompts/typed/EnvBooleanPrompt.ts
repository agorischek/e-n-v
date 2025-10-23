import { EnvPrompt } from "../EnvPrompt";
import type { EnvPromptOptions } from "../options/EnvPromptOptions";
import { S_RADIO_ACTIVE, S_RADIO_INACTIVE } from "../../visuals/symbols";
import type { Key } from "node:readline";
import type { PromptAction } from "../../types/PromptAction";
import type { BooleanEnvVarSchema } from "@envcredible/core";
import { padActiveRender } from "../utils/padActiveRender";

export class EnvBooleanPrompt extends EnvPrompt<boolean, BooleanEnvVarSchema> {
  cursor: number;

  constructor(schema: BooleanEnvVarSchema, opts: EnvPromptOptions<boolean>) {
    const customValidate = opts.validate;
    
    super(schema, {
      ...opts,
      render: padActiveRender(function (this: EnvBooleanPrompt) {
        if (this.state === "submit") {
          const outcomeResult = this.renderOutcomeResult();
          if (outcomeResult) {
            return outcomeResult;
          }

          const valueStr = this.value ? "true" : "false";
          return `${this.getSymbol()}  ${this.colors.bold(
            this.colors.white(this.key),
          )}${this.colors.subtle("=")}${this.colors.white(
            this.truncateValue(valueStr),
          )}`;
        }

        if (this.state === "cancel") {
          return this.renderCancelled();
        }

        let output = "";

        // Add header line with symbol based on state and key in bold white and description in gray if provided
        output += `${this.getSymbol()}  ${this.colors.bold(
          this.colors.white(this.key),
        )}`;
        if (this.spec.description) {
          output += ` ${this.colors.subtle(this.spec.description)}`;
        }
        output += "\n";

        // Build options array. We include a raw-current option when a current
        // value exists but is invalid so the user can see the raw invalid value.
        // Options order: [raw-current?] true, false (we'll annotate default/current where appropriate)
        const dimInputs = this.shouldDimInputs();

        type BoolOption = { kind: "raw"; raw: string } | { kind: "bool"; value: boolean; label: string };
        const options: BoolOption[] = [];

        // If there is a raw current value (stored separately), show it first
        if (this.currentRaw !== undefined) {
          options.push({ kind: "raw", raw: this.currentRaw });
        }

        // Add true/false options always
        options.push({ kind: "bool", value: true, label: "true" });
        options.push({ kind: "bool", value: false, label: "false" });

        options.forEach((option, index) => {
          const isSelected = index === this.cursor;
          const circle = dimInputs
            ? this.colors.dim(isSelected ? S_RADIO_ACTIVE : S_RADIO_INACTIVE)
            : isSelected
              ? this.theme.primary(S_RADIO_ACTIVE)
              : this.colors.dim(S_RADIO_INACTIVE);

          if (option.kind === "raw") {
            // Raw current value display (invalid or unprocessed)
            const displayRaw = this.currentValidationError
              ? this.colors.strikethrough(option.raw)
              : option.raw;
            const text = dimInputs
              ? this.colors.dim(displayRaw)
              : isSelected
                ? this.colors.white(displayRaw)
                : this.colors.subtle(displayRaw);
            const annotation = this.currentValidationError ? " (current, invalid)" : " (current)";
            let suffix = "";
            if (isSelected) {
              suffix = dimInputs
                ? this.colors.dim(annotation)
                : this.colors.subtle(annotation);
            }
            output += `${this.getBar()}  ${circle} ${text}${suffix}\n`;
            return;
          }

          // bool option
          const boolOption = option as Exclude<BoolOption, { kind: "raw" }>;

          // Determine annotation for bool options
          let annotation = "";
          if (
            this.current !== undefined &&
            typeof this.current === "boolean" &&
            this.current === boolOption.value &&
            this.default === boolOption.value
          ) {
            annotation = this.currentValidationError
              ? " (current, default, invalid)"
              : " (current, default)";
          } else if (
            this.current !== undefined &&
            typeof this.current === "boolean" &&
            this.current === boolOption.value
          ) {
            annotation = this.currentValidationError ? " (current, invalid)" : " (current)";
          } else if (this.default === boolOption.value) {
            annotation = " (default)";
          }

          const displayValue = boolOption.label;
          const text = dimInputs
            ? this.colors.dim(displayValue)
            : isSelected
              ? this.colors.white(displayValue)
              : this.colors.subtle(displayValue);
          let suffix = "";
          if (annotation) {
            suffix = dimInputs
              ? this.colors.dim(annotation)
              : isSelected
                ? this.colors.subtle(annotation)
                : "";
          }
          output += `${this.getBar()}  ${circle} ${text}${suffix}\n`;
        });

        // Add validation output with L-shaped pipe
        output += `${this.getBarEnd()}  ${this.renderFooter()}`;

        return output;
      }),
      validate: (value: boolean | undefined) => {
        if (this.consumeSkipValidation()) {
          return undefined;
        }
        if (this.getOutcome() !== "commit") {
          return undefined;
        }

        // If a raw current exists and cursor is on it, block submission
        if (this.currentRaw !== undefined) {
          if (this.cursor === 0) {
            return this.currentValidationError ?? "Current value is invalid";
          }
        }

        // Call custom validation if provided
        if (customValidate) {
          const customValidation = customValidate(value);
          if (customValidation) {
            return customValidation;
          }
        }

        return undefined;
      },
    });

      // Set cursor based on priority: default → current (if valid) → true
      // If there's a raw invalid current value, show it but do not focus it by default.
      // Options order: [raw-current?] true, false
      let baseIndex = 0;
      if (this.currentRaw !== undefined) {
        // raw current occupies index 0, so shift subsequent indices
        baseIndex = 1;
      }

      if (this.default !== undefined) {
        // If default exists, focus on its index
        this.cursor = baseIndex + (this.default ? 0 : 1);
      } else if (this.current !== undefined && !this.currentValidationError) {
        // No default, but valid current exists
        this.cursor = baseIndex + (this.current ? 0 : 1);
      } else {
        // No default and current invalid -> focus on first boolean option (not raw)
        this.cursor = baseIndex + 0; // true option
      }

    // Set initial value to current, or default, or false
    this.setCommittedValue(this.current ?? this.default ?? false);

    this.on("cursor", (action?: PromptAction) => {
      // Clear error state when user navigates (like base Prompt class does)
      if (this.state === "error") {
        this.state = "active";
        this.error = "";
      }

      if (this.isOptionPickerOpen()) {
        return;
      }

      switch (action) {
        case "up": {
          // Calculate max index (raw? + true + false)
          const maxIndex = (this.currentRaw !== undefined ? 2 : 1);
          this.cursor = this.cursor === 0 ? maxIndex : this.cursor - 1;
          break;
        }
        case "down": {
          const maxIndexDown = (this.currentRaw !== undefined ? 2 : 1);
          this.cursor = this.cursor === maxIndexDown ? 0 : this.cursor + 1;
          break;
        }
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

      if (this.handleFooterKey(char, info)) {
        return;
      }

      if (this.isOptionPickerOpen()) {
        return;
      }
    });
  }

  private updateValue() {
    // Options indices depend on presence of raw current
    if (this.currentRaw !== undefined) {
      // indices: 0 = raw, 1 = true, 2 = false
      if (this.cursor === 0) {
        // raw selected -> do not commit raw string; use default as fallback
        this.setCommittedValue(this.default ?? false);
        return;
      }
      this.setCommittedValue(this.cursor === 1);
      return;
    }

    // indices: 0 = true, 1 = false
    this.setCommittedValue(this.cursor === 0);
  }
}
