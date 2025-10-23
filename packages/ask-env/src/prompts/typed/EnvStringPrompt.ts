import { EnvPrompt } from "../EnvPrompt";
import type { EnvPromptOptions } from "../options/EnvPromptOptions";
import { S_RADIO_ACTIVE, S_RADIO_INACTIVE, S_CURSOR } from "../../visuals/symbols";
import type { Key } from "node:readline";
import type { PromptAction } from "../../types/PromptAction";
import { maskSecretValue } from "../../utils/secrets";
import type { StringEnvVarSchema } from "@envcredible/core";
import { padActiveRender } from "../utils/padActiveRender";

export class EnvStringPrompt extends EnvPrompt<string, StringEnvVarSchema> {
  cursor = 0;
  isTyping = false;

  constructor(schema: StringEnvVarSchema, opts: EnvPromptOptions<string>) {
    const customValidate = opts.validate;
    
    super(schema, {
      ...opts,
      render: padActiveRender(function (this: EnvStringPrompt) {
        if (this.state === "submit") {
          const outcomeResult = this.renderOutcomeResult();
          if (outcomeResult) {
            return outcomeResult;
          }

          return `${this.getSymbol()}  ${this.colors.bold(
            this.colors.white(this.key),
          )}${this.colors.subtle("=")}${this.colors.white(
            this.formatValue(this.value),
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

        const dimInputs = this.shouldDimInputs();

        // If both current and default are undefined AND no invalid existing value, show only text input
        if (this.current === undefined && this.default === undefined && !this.existingValidationError) {
          if (this.isTyping) {
            const displayText = dimInputs
              ? this.colors.dim(this.getInputDisplay(false))
              : this.colors.white(this.getInputDisplay(true));
            output += `${this.getBar()}  ${displayText}`;
          } else {
            const idleDisplay = dimInputs
              ? this.colors.dim(this.getInputDisplay(false))
              : this.colors.white(this.getInputDisplay(true));
            output += `${this.getBar()}  ${idleDisplay}`;
          }

          // Add validation output or placeholder text with L-shaped pipe
          output += "\n";
          output += `${this.getBarEnd()}  ${this.renderFooter(this.getEntryHint())}`;

          return output;
        }

        // Create options array dynamically based on what values exist
        const options: Array<
          { value: string | undefined; label: string } | string
        > = [];

        // Add existing invalid value if it exists and is invalid
        if (this.existing !== undefined && this.existingValidationError) {
          let label = "(current, invalid)";
          if (this.default !== undefined && this.existing === this.default) {
            label = "(current, default, invalid)";
          }
          options.push({
            value: this.existing,
            label,
          });
        }

        // Add current value if it exists (valid processed value)
        if (this.current !== undefined) {
          let label = "(current)";
          if (this.default !== undefined && this.current === this.default) {
            label = "(current, default)";
          }
          options.push({
            value: this.current,
            label,
          });
        }

        // Add default value if it exists and is different from current
        if (this.default !== undefined && this.current !== this.default) {
          options.push({ value: this.default, label: "(default)" });
        }

        // Always add the custom entry option
        options.push("Other");

        options.forEach((option, index) => {
          const isSelected = index === this.cursor;
          const circle = dimInputs
            ? this.colors.dim(isSelected ? S_RADIO_ACTIVE : S_RADIO_INACTIVE)
            : isSelected
              ? this.theme.primary(S_RADIO_ACTIVE)
              : this.colors.dim(S_RADIO_INACTIVE);

          if (typeof option === "string") {
            // "Other" option
            if (this.isTyping) {
              const displayText = dimInputs
                ? this.colors.dim(this.getInputDisplay(false))
                : this.colors.white(this.getInputDisplay(true));
              output += `${this.getBar()}  ${circle} ${displayText}\n`;
            } else if (isSelected) {
              if (dimInputs) {
                output += `${this.getBar()}  ${circle} ${this.colors.dim(option)}\n`;
              } else {
                output += `${this.getBar()}  ${circle} ${this.colors.white(this.getInputDisplay(true))}\n`;
              }
            } else {
              // "Other" is gray when not selected
              const text = dimInputs
                ? this.colors.dim(option)
                : this.colors.subtle(option);
              output += `${this.getBar()}  ${circle} ${text}\n`;
            }
          } else {
            // Current/Default options
            let displayValue = this.formatValue(option.value);
            
            // Apply strikethrough if this is an invalid existing value
            const isInvalidExisting = option.value === this.existing && this.existingValidationError;
            if (isInvalidExisting) {
              displayValue = this.colors.strikethrough(displayValue);
            }
            
            const text = dimInputs
              ? this.colors.dim(displayValue)
              : isSelected
                ? this.colors.white(displayValue)
                : this.colors.subtle(displayValue);
            const annotation = ` ${option.label}`;
            let suffix = "";
            if (isSelected) {
              suffix = dimInputs
                ? this.colors.dim(annotation)
                : this.colors.subtle(annotation);
            }
            output += `${this.getBar()}  ${circle} ${text}${suffix}\n`;
          }
        });

        // Add validation output or placeholder text with L-shaped pipe
        output += `${this.getBarEnd()}  ${this.renderFooter(this.getEntryHint())}`;

        return output;
      }),
      validate: (value: string | undefined) => {
        if (this.consumeSkipValidation()) {
          return undefined;
        }
        if (this.getOutcome() !== "commit") {
          return undefined;
        }

        // Block submission if selecting an invalid existing value
        if (this.existing !== undefined && this.existingValidationError && value === this.existing) {
          return this.existingValidationError;
        }

        // If both current and default are undefined, we're in text-only mode
        if (this.current === undefined && this.default === undefined) {
          if (!this.userInput || !this.userInput.trim()) {
            if (this.required) {
              return "Please enter a value";
            }
            return undefined;
          }
          // Validate the user input format first
          const inputValidation = this.validateInput(this.userInput);
          if (inputValidation) {
            return inputValidation;
          }
          // If format is valid, run custom validation if provided
          let parsedValue: string | undefined;
          try {
            parsedValue = this.parseInput(this.userInput);
          } catch {
            parsedValue = undefined;
          }
          return undefined;
        }

        // Calculate the text input index dynamically
        const textInputIndex = this.getTextInputIndex();

        // If we're on the custom entry option but not typing yet, prevent submission
        if (this.cursor === textInputIndex && !this.isTyping) {
          // Start typing mode instead of submitting
          this.isTyping = true;
          this.track = true;
          this._setUserInput("");
          this.updateValue();
          return "Value cannot be empty"; // This will cause validation to fail and stay active
        }

        // If we're typing on the custom option but haven't entered anything, prevent submission
        if (
          this.cursor === textInputIndex &&
          this.isTyping &&
          (!this.userInput || !this.userInput.trim())
        ) {
          if (this.required) {
            return "Please enter a value";
          }
          return undefined;
        }

        // If we're typing, validate the input
        if (this.isTyping && this.userInput) {
          const inputValidation = this.validateInput(this.userInput);
          if (inputValidation) {
            return inputValidation;
          }
          // Validate against the schema processor
          let parsedValue: string | undefined;
          try {
            parsedValue = this.parseInput(this.userInput);
            // Also run through schema validation
            if (parsedValue !== undefined) {
              (this.spec as any).process(parsedValue);
            }
          } catch (error) {
            // Schema validation failed
            const message = error instanceof Error ? error.message : String(error);
            return message;
          }
          // Call custom validation if provided
          if (customValidate) {
            const customValidation = customValidate(parsedValue);
            if (customValidation) {
              return customValidation;
            }
          }
          return undefined;
        }

        // For non-typing cases (selecting current/default), check for validation errors first
        // If the user is selecting the current value and it has a validation error, block submission
        if (!this.isTyping && this.current !== undefined && this.existingValidationError) {
          // Check if user is selecting the current value option
          let isSelectingCurrentValue = false;
          let optionIndex = 0;
          
          // Check if cursor is on current value
          if (this.current !== undefined && this.cursor === optionIndex) {
            isSelectingCurrentValue = true;
          }
          
          if (isSelectingCurrentValue) {
            return this.existingValidationError;
          }
        }

        // For non-typing cases (selecting current/default), run custom validation
        if (customValidate) {
          const customValidation = customValidate(value);
          if (customValidation) {
            return customValidation;
          }
        }

        return undefined;
      },
    });

    // Determine initialization strategy
    if (this.current === undefined && this.default === undefined) {
      // No valid values - start in typing mode (even if there's an invalid existing value to display)
      this.isTyping = true;
      this.track = true;
      this.cursor = this.getTextInputIndex(); // Position cursor on text input
      this.setCommittedValue(this.getDefaultValue());
    } else {
      // We have valid current or default values - show options with navigation
      let initialCursor = 0;
      
      if (this.current !== undefined) {
        // Valid current exists: focus on current (account for invalid existing option)
        const hasInvalidExisting = this.existing !== undefined && this.existingValidationError;
        initialCursor = hasInvalidExisting ? 1 : 0; // Skip invalid existing option if present
      } else if (this.default !== undefined) {
        // No valid current, but default exists: focus on default (account for invalid existing option)
        const hasInvalidExisting = this.existing !== undefined && this.existingValidationError;
        initialCursor = hasInvalidExisting ? 1 : 0; // Skip invalid existing option if present
      } else {
        // No valid current or default: focus on "Other" option
        initialCursor = this.getTextInputIndex();
      }
      
      this.cursor = initialCursor;
      // Set initial value to current
      this.setCommittedValue(this.current ?? this.getDefaultValue());
    }

    this.on("cursor", (action?: PromptAction) => {
      // Clear error state when user navigates (like base Prompt class does)
      if (this.state === "error") {
        this.state = "active";
        this.error = "";
      }

      // If both current and default are undefined AND no invalid existing value, we're in text-only mode - no cursor navigation
      if (this.current === undefined && this.default === undefined && !this.existingValidationError) {
        return;
      }

      if (this.isOptionPickerOpen()) {
        return;
      }

      switch (action) {
        case "up":
          // Calculate max index based on actual options
          let optionsCount = 0;
          if (this.existing !== undefined && this.existingValidationError) optionsCount++; // Invalid existing option
          if (this.current !== undefined) optionsCount++; // Valid current option
          if (this.default !== undefined && this.current !== this.default)
            optionsCount++;
          optionsCount++; // For "Other" option
          const maxIndex = optionsCount - 1;

          // If we're typing or on the text option, clear input and exit typing mode
          if (this.isTyping || this.cursor === maxIndex) {
            this.isTyping = false;
            this.track = false;
            this._clearUserInput(); // This clears the internal readline state too
          }
          this.cursor = this.cursor === 0 ? maxIndex : this.cursor - 1;
          break;
        case "down":
          // Calculate max index based on actual options
          let optionsCountDown = 0;
          if (this.existing !== undefined && this.existingValidationError) optionsCountDown++; // Invalid existing option
          if (this.current !== undefined) optionsCountDown++; // Valid current option
          if (this.default !== undefined && this.current !== this.default)
            optionsCountDown++;
          optionsCountDown++; // For "Other" option
          const maxIndexDown = optionsCountDown - 1;

          // If we're typing or on the text option, clear input and exit typing mode
          if (this.isTyping || this.cursor === maxIndexDown) {
            this.isTyping = false;
            this.track = false;
            this._clearUserInput(); // This clears the internal readline state too
          }
          this.cursor = this.cursor === maxIndexDown ? 0 : this.cursor + 1;
          break;
      }
      this.updateValue();
    });

    // Listen for user input changes (when typing)
    this.on("userInput", (input: string) => {
      // Clear error state when user is typing (like base Prompt class does)
      if (this.state === "error") {
        this.state = "active";
        this.error = "";
      }

      if (this.isTyping) {
        try {
          const parsed = this.parseInput(input);
          this.setCommittedValue(parsed ?? this.getDefaultValue());
        } catch {
          // If parsing fails, keep the current value but still update display
          // The validation will catch this
        }
      }
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

      if (this.secret && info.ctrl && info.name === "r") {
        this.toggleSecretReveal();
        return;
      }

      if (this.isOptionPickerOpen()) {
        return;
      }

      // If both current and default are undefined, we're in text-only mode
      if (this.current === undefined && this.default === undefined) {
        // Already in typing mode, just update the value as the user types
        if (this.isTyping) {
          try {
            const parsed = this.parseInput(this.userInput);
            this.setCommittedValue(parsed ?? this.getDefaultValue());
          } catch {
            // Keep current value if parsing fails
          }
        }
        return;
      }

      // If any printable character is pressed and we're not already typing,
      // jump to the text input option and start typing
      if (
        char &&
        char.length === 1 &&
        !info.ctrl &&
        !info.meta &&
        !this.isTyping
      ) {
        const isArrowKey = ["up", "down", "left", "right"].includes(
          info.name || "",
        );
        const isControlKey = ["return", "enter", "escape", "tab"].includes(
          info.name || "",
        );

        if (!isArrowKey && !isControlKey) {
          // Calculate the text input index dynamically
          const textInputIndex = this.getTextInputIndex();

          this.cursor = textInputIndex; // Jump to the "Other" option
          this.isTyping = true;
          // Enable value tracking and set the initial character
          this.track = true;
          this._setUserInput(char);
          // Manually set the cursor position to be after the character
          (this as any)._cursor = char.length;
          this.updateValue();
          return;
        }
      }

      // Calculate the text input index dynamically
      const textInputIndex = this.getTextInputIndex();

      if (this.cursor === textInputIndex) {
        // Text input option
        if (info.name === "escape") {
          // Exit typing mode
          this.isTyping = false;
          this.track = false;
          this._clearUserInput(); // Clear the internal readline state
          this.updateValue();
          return; // Prevent default Escape behavior
        }
      }
    });
  }

  private updateValue() {
    // If both current and default are undefined AND no invalid existing value, we're in text-only mode
    if (this.current === undefined && this.default === undefined && !this.existingValidationError) {
      try {
        const parsed = this.parseInput(this.userInput);
        this.setCommittedValue(parsed ?? this.getDefaultValue());
      } catch {
        this.setCommittedValue(this.getDefaultValue());
      }
      return;
    }

    if (!this.isTyping) {
      // Dynamically determine what option the cursor is on
      let optionIndex = 0;

      // Check if cursor is on invalid existing value
      if (this.existing !== undefined && this.existingValidationError && this.cursor === optionIndex) {
        this.setCommittedValue(this.existing);
        return;
      }
      if (this.existing !== undefined && this.existingValidationError) optionIndex++;

      // Check if cursor is on current value
      if (this.current !== undefined && this.cursor === optionIndex) {
        this.setCommittedValue(this.current);
        return;
      }
      if (this.current !== undefined) optionIndex++;

      // Check if cursor is on default value (and it's different from current)
      if (
        this.default !== undefined &&
        this.current !== this.default &&
        this.cursor === optionIndex
      ) {
        this.setCommittedValue(this.default);
        return;
      }
      if (this.default !== undefined && this.current !== this.default)
        optionIndex++;

      // If we get here, cursor is on "Other" option
      this.setCommittedValue(this.getDefaultValue());
    } else {
      try {
        const parsed = this.parseInput(this.userInput);
        this.setCommittedValue(parsed ?? this.getDefaultValue());
      } catch {
        this.setCommittedValue(this.getDefaultValue());
      }
    }
  }

  protected formatValue(value: string | undefined): string {
    const str = value || "";
    const display =
      this.secret && str && !this.isSecretRevealed()
        ? this.maskValue(str)
        : str;
    return this.truncateValue(display);
  }

  protected parseInput(input: string): string | undefined {
    return input || undefined;
  }

  protected validateInput(_input: string): string | undefined {
    // For strings, any non-empty input is valid by default
    // Custom validation will be handled separately
    return undefined;
  }

  protected getDefaultValue(): string {
    return "";
  }

  private maskValue(value: string): string {
    return maskSecretValue(value, this.mask);
  }

  private getTextInputIndex(): number {
    let index = 0;
    // Count invalid existing value option if present
    if (this.existing !== undefined && this.existingValidationError) index++;
    // Count current value option if present
    if (this.current !== undefined) index++;
    // Count default value option if present and different from current
    if (this.default !== undefined && this.current !== this.default) index++;
    return index;
  }

  private getInputDisplay(includeCursor: boolean): string {
    const inputValue = this.userInput ?? "";
    const isMasked = this.secret && inputValue && !this.isSecretRevealed();
    const base = isMasked ? this.maskValue(inputValue) : inputValue;

    if (!includeCursor) {
      return base;
    }

    const internalCursor = (this as unknown as { _cursor?: number })._cursor;
    const rawCursor = this.isTyping
      ? Math.max(0, internalCursor ?? 0)
      : 0;
    const maskLength = isMasked ? Math.max(1, this.mask.length) : 1;
    const cursorIndex = Math.min(rawCursor * maskLength, base.length);

    if (cursorIndex >= base.length) {
      return `${base}${S_CURSOR}`;
    }

    const segmentLength = maskLength;
    const before = base.slice(0, cursorIndex);
    const cursorSegment =
      base.slice(cursorIndex, cursorIndex + segmentLength) || " ";
    const after = base.slice(cursorIndex + segmentLength);

    return `${before}${this.colors.inverse(cursorSegment)}${after}`;
  }

  private getEntryHint(): string {
    return this.secret ? "Enter a secret value" : "Enter a value";
  }
}
