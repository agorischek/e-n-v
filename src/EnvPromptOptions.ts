import color from "picocolors";

export interface EnvPromptOptions<T> {
    key: string;
    description?: string;
    current?: T;
    default?: T;
    required: boolean;
    validate?: ((value: T | undefined) => string | Error | undefined) | undefined;
    themeColor?: (text: string) => string;
}

// Default theme color function
export function defaultThemeColor(text: string): string {
    return color.greenBright(text);
}