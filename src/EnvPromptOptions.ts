export interface EnvPromptOptions<T> {
    key: string;
    description?: string;
    current?: T;
    default?: T;
    required: boolean;
    validate?: ((value: T | undefined) => string | Error | undefined) | undefined;
}