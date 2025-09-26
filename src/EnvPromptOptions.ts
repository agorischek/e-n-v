import color from "picocolors";
import { Theme } from "./Theme";

export interface EnvPromptOptions<T> {
    key: string;
    description?: string;
    current?: T;
    default?: T;
    required: boolean;
    validate?: ((value: T | undefined) => string | Error | undefined) | undefined;
    theme?: Theme;
}

// Default theme for backward compatibility
export const defaultTheme = new Theme(color.greenBright);

// Default theme color function (kept for backward compatibility)
export function defaultThemeColor(text: string): string {
    return color.greenBright(text);
}