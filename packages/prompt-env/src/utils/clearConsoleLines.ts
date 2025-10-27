import { cursorTo, clearLine, moveCursor } from "node:readline";

export function clearConsoleLines(lineCount: number): void {
  const output = process.stdout;
  if (!output?.isTTY) {
    return;
  }

  try {
    for (let i = 0; i < lineCount; i++) {
      moveCursor(output, 0, -1);
      cursorTo(output, 0);
      clearLine(output, 0);
    }
    cursorTo(output, 0);
  } catch {
    // Non-TTY environments or cursor failures should not crash the flow.
  }
}
