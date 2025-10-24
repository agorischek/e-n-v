export interface ToolbarConfig {
  index: number;
  secret: boolean;
  isSecretRevealed: boolean;
  actions: {
    toggleSecret: () => void;
    skip: () => void;
    previous: () => void;
    close: () => void;
  };
}