export interface EnvPromptOptions<T> {
    key: string;
    description?: string;
    current?: T;
    default?: T;
    required: boolean;
}