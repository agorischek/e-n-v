declare module "tsx/esm/api" {
  type RegisterOptions = {
    cwd?: string;
    tsconfigPath?: string;
    experimentalTsImportPlugin?: boolean;
    ignoreWarnings?: boolean;
  };

  export function register(options?: RegisterOptions): void;
}
