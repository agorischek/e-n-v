import color from "picocolors";

export type ColorFunction = (text: string) => string;

export class Theme {
  primary: ColorFunction;
  subtle: ColorFunction;
  warn: ColorFunction;
  error: ColorFunction;

  constructor(main: ColorFunction) {
    this.primary = main;
    this.subtle = color.gray;
    this.warn = color.yellow;
    this.error = color.red;
  }
}