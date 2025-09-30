import color from "picocolors";

export type ColorFunction = (text: string) => string;

export class Theme {
  public static default = new Theme(color.magenta);
  
  primary: ColorFunction;
  bgPrimary: ColorFunction;
  subtle: ColorFunction;
  warn: ColorFunction;
  bgWarn: ColorFunction;
  error: ColorFunction;
  bgError: ColorFunction;
  
  constructor(main: ColorFunction) {
    this.primary = main;
    this.bgPrimary = this.getBackgroundColor(main);
    this.subtle = color.gray;
    this.warn = color.yellow;
    this.bgWarn = this.getBackgroundColor(color.yellow);
    this.error = color.red;
    this.bgError = this.getBackgroundColor(color.red);
  }

  /**
   * Get the background version of a color function
   */
  private getBackgroundColor(colorFn: ColorFunction): ColorFunction {
    // Check for common color functions and return their background equivalents
    if (colorFn === color.black) return color.bgBlack;
    if (colorFn === color.red) return color.bgRed;
    if (colorFn === color.green) return color.bgGreen;
    if (colorFn === color.yellow) return color.bgYellow;
    if (colorFn === color.blue) return color.bgBlue;
    if (colorFn === color.magenta) return color.bgMagenta;
    if (colorFn === color.cyan) return color.bgCyan;
    if (colorFn === color.white) return color.bgWhite;
    if (colorFn === color.redBright) return color.bgRedBright;
    if (colorFn === color.greenBright) return color.bgGreenBright;
    if (colorFn === color.yellowBright) return color.bgYellowBright;
    if (colorFn === color.blueBright) return color.bgBlueBright;
    if (colorFn === color.magentaBright) return color.bgMagentaBright;
    if (colorFn === color.cyanBright) return color.bgCyanBright;
    if (colorFn === color.whiteBright) return color.bgWhiteBright;
    
    // Fallback to a neutral background
    return color.bgBlack;
  }
}