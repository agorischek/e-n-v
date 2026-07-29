export const steps = [
  { name: "Lint", command: "bun run lint" },
  { name: "Type Check", command: "bun run check:types" },
  { name: "Format Check", command: "bun run check:format" },
  { name: "Tests", command: "bun run test" },
  { name: "Bundle Check", command: "bun run check:bundle" },
  { name: "Bundle", command: "bun run bundle" },
];
