import type { Key } from "node:readline";
import type { ToolbarEntry } from "./ToolbarEntry";
import type { ToolbarConfig } from "./ToolbarConfig";
import type { Theme } from "../../visuals/Theme";
import { S_TOOL_ACTIVE, S_TOOL_INACTIVE } from "../../visuals/symbols";

export class Toolbar {
  private _isOpen: boolean = false;
  private cursor: number = 0;
  private readonly previous: boolean;
  private readonly link?: string;
  private readonly theme: Theme;
  private readonly actions: {
    toggleSecret: () => void;
    skip: () => void;
    previous: () => void;
    openLink: () => void;
  };

  public secret: "shown" | "hidden" | false;

  constructor(config: ToolbarConfig) {
    this.previous = config.previous;
    this.secret = config.secret;
    this.link = config.link;
    this.theme = config.theme;
    this.actions = config.actions;
  }

  public get isOpen(): boolean {
    return this._isOpen;
  }

  public open(): void {
    this._isOpen = true;
    this.cursor = 0;
  }

  public close(): void {
    this._isOpen = false;
    this.cursor = 0;
  }

  public handleKey(char: string | undefined, info: Key): boolean {
    if (!info) {
      return false;
    }

    if (info.name === "tab") {
      if (!this._isOpen) {
        this.open();
      } else {
        this.close();
      }
      return true;
    }

    if (!this._isOpen) {
      return false;
    }

    switch (info.name) {
      case "left":
      case "up":
        this.shiftCursor(-1);
        return true;
      case "right":
      case "down":
        this.shiftCursor(1);
        return true;
      case "return":
      case "enter":
        this.activateOption();
        return true;
    }

    if (char && char.length === 1 && !info.ctrl && !info.meta) {
      this.close();
      return false;
    }

    return false;
  }

  public render(): string {
    if (!this._isOpen) {
      return "";
    }

    const options = this.getOptions();
    this.ensureCursor(options);
    if (!options.length) {
      return this.theme.subtle("Tab to return");
    }

    const separator = this.theme.subtle(" / ");
    const optionStrings = options.map((option, index) => {
      const isFocused = index === this.cursor;
      const icon = isFocused ? S_TOOL_ACTIVE : S_TOOL_INACTIVE;
      const label = `${icon} ${option.label}`;

      return isFocused ? this.theme.primary(label) : this.theme.subtle(label);
    });

    const leftSide = optionStrings.join(separator);
    const rightSide = this.theme.subtle("Tab to return");

    // Add separator between left entries and right hint
    return `${leftSide}${separator}${rightSide}`;
  }

  private shiftCursor(delta: number): void {
    const options = this.getOptions();
    if (!options.length) {
      return;
    }

    let nextIndex = this.cursor;
    const len = options.length;
    for (let step = 0; step < len; step++) {
      nextIndex = (nextIndex + delta + len) % len;
      this.cursor = nextIndex;
      return;
    }
  }

  private activateOption(): void {
    const options = this.getOptions();
    this.ensureCursor(options);
    const selected = options[this.cursor];
    if (!selected) {
      return;
    }

    // Close toolbar first
    this.close();

    // Execute the action
    selected.action();
  }

  private ensureCursor(options: ToolbarEntry[]): void {
    if (!options.length) {
      this.cursor = 0;
      return;
    }

    if (this.cursor >= options.length) {
      this.cursor = 0;
    }
  }

  private getOptions(): ToolbarEntry[] {
    const options: ToolbarEntry[] = [
      {
        key: "skip",
        label: "Skip",
        action: this.actions.skip,
      },
    ];

    if (this.previous) {
      options.push({
        key: "previous",
        label: "Previous",
        action: this.actions.previous,
      });
    }

    if (this.secret !== false) {
      options.push({
        key: "toggleSecret",
        label: this.secret === "shown" ? "Hide" : "Show",
        action: this.actions.toggleSecret,
      });
    }

    if (this.link) {
      options.push({
        key: "openLink",
        label: "Open link",
        action: this.actions.openLink,
      });
    }

    return options;
  }
}
