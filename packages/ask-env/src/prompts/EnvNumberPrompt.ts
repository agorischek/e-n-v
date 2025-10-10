import { EnvPrompt } from "./EnvPrompt";
import type { EnvPromptOptions } from "./EnvPrompt";
import { S_RADIO_ACTIVE, S_RADIO_INACTIVE, S_CURSOR } from "../visuals/symbols";
import type { Key } from "node:readline";
import type { PromptAction } from "./types/PromptAction";

interface EnvNumberPromptOptions extends EnvPromptOptions<number> {}

export class EnvNumberPrompt extends EnvPrompt<number> {
  cursor = 0;
  isTyping = false;
  protected options: EnvNumberPromptOptions;

  constructor(opts: EnvNumberPromptOptions) {
    super(
      {
        ...opts,
        theme: opts.theme,
        render: function (this: EnvNumberPrompt) {
          if (this.state === "submit") {
            const outcomeResult = this.renderOutcomeResult();
            if (outcomeResult) {
              return outcomeResult;
            }

            return `${this.getSymbol()}  ${this.colors.bold(
              this.colors.white(this.key)
            )}${this.colors.subtle("=")}${this.colors.white(
              this.formatValue(this.value)
            )}`;
          }

          if (this.state === "cancel") {
            return this.renderCancelled();
          }

          let output = "";

          // Add header line with symbol based on state and key in bold white and description in gray if provided
          output += `${this.getSymbol()}  ${this.colors.bold(
            this.colors.white(this.key)
          )}`;
          if (opts.description) {
            output += ` ${this.colors.subtle(opts.description)}`;
          }
          output += "\n";

          const dimInputs = this.shouldDimInputs();

          // If both current and default are undefined, show only text input
          if (this.current === undefined && this.default === undefined) {
            const typedValue = this.userInput ?? "";

            if (this.isTyping) {
              const displayText = dimInputs
                ? this.colors.dim(typedValue)
                : this.colors.white(`${typedValue}${S_CURSOR}`);
              output += `${this.getBar()}  ${displayText}`;
            } else {
              const cursorDisplay = dimInputs
                ? this.colors.dim(typedValue)
                : this.colors.white(S_CURSOR);
              output += `${this.getBar()}  ${cursorDisplay}`;
            }

            // Add validation output or placeholder text with L-shaped pipe
            output += "\n";
            output += `${this.getBarEnd()}  ${this.renderFooter("Enter a number")}`;

            return output;
          }

          // Create options array dynamically based on what values exist
          const options: Array<
            { value: number | undefined; label: string } | string
          > = [];

          // Add current value if it exists
          if (this.current !== undefined) {
            if (this.default !== undefined && this.current === this.default) {
              options.push({
                value: this.current,
                label: "(current, default)",
              });
            } else {
              options.push({ value: this.current, label: "(current)" });
            }
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
              ? this.colors.dim(
                  isSelected ? S_RADIO_ACTIVE : S_RADIO_INACTIVE
                )
              : isSelected
              ? this.theme.primary(S_RADIO_ACTIVE)
              : this.colors.dim(S_RADIO_INACTIVE);

            if (typeof option === "string") {
              // "Other" option
              if (this.isTyping) {
                const typedValue = this.userInput ?? "";
                const displayText = dimInputs
                  ? this.colors.dim(typedValue)
                  : this.colors.white(`${typedValue}${S_CURSOR}`);
                output += `${this.getBar()}  ${circle} ${displayText}\n`;
              } else if (isSelected) {
                // Show cursor immediately when selected, even before typing
                const selectedDisplay = dimInputs
                  ? this.colors.dim(option)
                  : this.colors.white(S_CURSOR);
                output += `${this.getBar()}  ${circle} ${selectedDisplay}\n`;
              } else {
                // "Other" is gray when not selected
                const text = dimInputs
                  ? this.colors.dim(option)
                  : this.colors.subtle(option);
                output += `${this.getBar()}  ${circle} ${text}\n`;
              }
            } else {
              // Current/Default options
              const displayValue = this.formatValue(option.value);
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
          output += `${this.getBarEnd()}  ${this.renderFooter("Enter a number")}`;

          return output;
        },
        validate: (value: number | undefined) => {
          if (this.getOutcome() !== "commit") {
            return undefined;
          }
          // If both current and default are undefined, we're in text-only mode
          if (
            this.options.current === undefined &&
            this.options.default === undefined
          ) {
            if (!this.userInput || !this.userInput.trim()) {
              return "Please enter a number";
            }
            // Validate the user input format first
            const inputValidation = this.validateInput(this.userInput);
            if (inputValidation) {
              return inputValidation;
            }
            // If format is valid, run custom validation if provided
            if (this.validate) {
              const parsedValue = this.parseInput(this.userInput);
              const customValidation = this.validate(parsedValue);
              if (customValidation) {
                return customValidation instanceof Error
                  ? customValidation.message
                  : customValidation;
              }
            }
            return undefined;
          }

          // Calculate the text input index dynamically
          let textInputIndex = 0;
          if (this.options.current !== undefined) textInputIndex++;
          if (
            this.options.default !== undefined &&
            this.options.current !== this.options.default
          )
            textInputIndex++;
          // textInputIndex now points to the "Other" option

          // If we're on the custom entry option but not typing yet, start typing mode
          if (this.cursor === textInputIndex && !this.isTyping) {
            // Start typing mode instead of submitting
            this.isTyping = true;
            this.track = true;
            this._setUserInput("");
            this.updateValue();
            return "Please enter a number"; // Show error since no input provided yet
          }

          // If we're typing on the custom option but haven't entered anything, prevent submission
          if (
            this.cursor === textInputIndex &&
            this.isTyping &&
            (!this.userInput || !this.userInput.trim())
          ) {
            return "Please enter a number";
          }

          // If we're typing, validate the input
          if (this.isTyping && this.userInput) {
            const inputValidation = this.validateInput(this.userInput);
            if (inputValidation) {
              return inputValidation;
            }
            // If format is valid, run custom validation if provided
            if (this.validate) {
              const parsedValue = this.parseInput(this.userInput);
              const customValidation = this.validate(parsedValue);
              if (customValidation) {
                return customValidation instanceof Error
                  ? customValidation.message
                  : customValidation;
              }
            }
          }

          // For non-typing cases (selecting current/default), validate the selected value
          if (!this.isTyping && this.validate) {
            const customValidation = this.validate(value);
            if (customValidation) {
              return customValidation instanceof Error
                ? customValidation.message
                : customValidation;
            }
          }

          // All other cases are valid
          return undefined;
        },
      }
    );

    this.options = opts;

    // If both current and default are undefined, start in typing mode
    if (this.current === undefined && this.default === undefined) {
      this.isTyping = true;
      this.track = true;
      this.setCommittedValue(this.getDefaultValue());
    } else {
      // Set initial value based on cursor position
      this.updateValue();
    }

    this.on("cursor", (action?: PromptAction) => {
      // Clear error state when user navigates (like base Prompt class does)
      if (this.state === "error") {
        this.state = "active";
        this.error = "";
      }

      // If both current and default are undefined, we're in text-only mode - no cursor navigation
      if (
        this.options.current === undefined &&
        this.options.default === undefined
      ) {
        return;
      }

      if (this.isOptionPickerOpen()) {
        return;
      }

      switch (action) {
        case "up":
          // Calculate max index based on actual options
          let optionsCount = 0;
          if (this.options.current !== undefined) optionsCount++;
          if (
            this.options.default !== undefined &&
            this.options.current !== this.options.default
          )
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
          if (this.options.current !== undefined) optionsCountDown++;
          if (
            this.options.default !== undefined &&
            this.options.current !== this.options.default
          )
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

      // Delegate Tab and footer navigation to the shared handler
      if (this.handleFooterKey(char, info)) {
        return;
      }

      if (this.isOptionPickerOpen()) {
        return;
      }

      // If both current and default are undefined, we're in text-only mode
      if (
        this.options.current === undefined &&
        this.options.default === undefined
      ) {
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
          info.name || ""
        );
        const isControlKey = ["return", "enter", "escape", "tab"].includes(
          info.name || ""
        );

        if (!isArrowKey && !isControlKey) {
          // Calculate the text input index dynamically
          let textInputIndex = 0;
          if (this.options.current !== undefined) textInputIndex++;
          if (
            this.options.default !== undefined &&
            this.options.current !== this.options.default
          )
            textInputIndex++;

          this.cursor = textInputIndex; // Jump to the "Other" option
          this.isTyping = true;
          // Enable value tracking and set the initial character
          this.track = true;
          this._setUserInput(char);
          this.updateValue();
          return;
        }
      }

      // Calculate the text input index dynamically
      let textInputIndex = 0;
      if (this.options.current !== undefined) textInputIndex++;
      if (
        this.options.default !== undefined &&
        this.options.current !== this.options.default
      )
        textInputIndex++;

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
    // If both current and default are undefined, we're in text-only mode
    if (
      this.options.current === undefined &&
      this.options.default === undefined
    ) {
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

      // Check if cursor is on current value
      if (this.options.current !== undefined && this.cursor === optionIndex) {
        this.setCommittedValue(this.options.current);
        return;
      }
      if (this.options.current !== undefined) optionIndex++;

      // Check if cursor is on default value (and it's different from current)
      if (
        this.options.default !== undefined &&
        this.options.current !== this.options.default &&
        this.cursor === optionIndex
      ) {
        this.setCommittedValue(this.options.default);
        return;
      }
      if (
        this.options.default !== undefined &&
        this.options.current !== this.options.default
      )
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

  protected formatValue(value: number | undefined): string {
    const str = value !== undefined ? value.toString() : "";
    return this.truncateValue(str);
  }

  protected parseInput(input: string): number | undefined {
    if (!input || !input.trim()) {
      return undefined;
    }

    const parsed = Number(input.trim());
    if (isNaN(parsed)) {
      return undefined;
    }

    return parsed;
  }

  protected validateInput(input: string): string | undefined {
    if (!input || !input.trim()) {
      return "Please enter a number";
    }

    const parsed = Number(input.trim());
    if (isNaN(parsed)) {
      return "Please enter a valid number";
    }

    return undefined;
  }

  protected getDefaultValue(): number {
    return 0;
  }

  private getTextInputIndex(): number {
    let index = 0;
    if (this.options.current !== undefined) index++;
    if (
      this.options.default !== undefined &&
      this.options.current !== this.options.default
    )
      index++;
    return index;
  }
}
