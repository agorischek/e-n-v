export type QuoteStyle = "single" | "double" | "none";

export interface SplitValueCommentResult {
  valuePart: string;
  commentPart: string;
}

export function splitValueComment(raw: string): SplitValueCommentResult {
  let inSingle = false;
  let inDouble = false;

  for (let index = 0; index < raw.length; index += 1) {
    const char = raw[index];

    if (char === "'" && !inDouble) {
      inSingle = !inSingle;
    } else if (char === '"' && !inSingle && !isEscaped(raw, index)) {
      inDouble = !inDouble;
    }

    if (!inSingle && !inDouble && char === "#") {
      let commentStart = index;
      while (
        commentStart > 0 &&
        (raw[commentStart - 1] === " " || raw[commentStart - 1] === "\t")
      ) {
        commentStart -= 1;
      }

      return {
        valuePart: raw.slice(0, commentStart),
        commentPart: raw.slice(commentStart),
      };
    }
  }

  return { valuePart: raw, commentPart: "" };
}

function isEscaped(raw: string, index: number): boolean {
  let backslashes = 0;
  for (let i = index - 1; i >= 0 && raw[i] === "\\"; i -= 1) {
    backslashes += 1;
  }
  return backslashes % 2 === 1;
}

export function decodeValue(raw: string): string {
  if (!raw) {
    return "";
  }

  const { valuePart } = splitValueComment(raw);

  if (valuePart.startsWith('"') && valuePart.endsWith('"')) {
    const inner = valuePart.slice(1, -1);
    return inner
      .replace(/\\n/g, "\n")
      .replace(/\\r/g, "\r")
      .replace(/\\t/g, "\t")
      .replace(/\\\\/g, "\\")
      .replace(/\\\"/g, '"');
  }

  if (valuePart.startsWith("'") && valuePart.endsWith("'")) {
    return valuePart.slice(1, -1);
  }

  return valuePart;
}

export function needsQuoting(value: string): boolean {
  if (value === "") {
    return false;
  }
  return /\s|#|=|"|\n|\r/.test(value);
}

export function encodeValue(
  value: string,
  existingRaw: string | null
): string {
  const preferredStyle = existingRaw ? detectStyle(existingRaw) : null;
  const style = chooseStyle(value, preferredStyle);

  if (style === "none") {
    return value;
  }

  if (style === "single") {
    return `'${value.replace(/'/g, "\\'")}'`;
  }

  return `"${escapeDoubleQuoted(value)}"`;
}

function detectStyle(raw: string): QuoteStyle {
  if (raw.startsWith('"') && raw.endsWith('"')) {
    return "double";
  }
  if (raw.startsWith("'") && raw.endsWith("'")) {
    return "single";
  }
  return "none";
}

function chooseStyle(value: string, preferred: QuoteStyle | null): QuoteStyle {
  if (preferred && canUseStyle(preferred, value)) {
    return preferred;
  }

  if (!needsQuoting(value)) {
    return "none";
  }

  if (canUseStyle("single", value)) {
    return "single";
  }

  return "double";
}

function canUseStyle(style: QuoteStyle, value: string): boolean {
  if (style === "none") {
    return !needsQuoting(value);
  }

  if (style === "single") {
    return !value.includes("'") && !value.includes("\n") && !value.includes("\r");
  }

  return true;
}

export function escapeDoubleQuoted(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/\t/g, "\\t")
    .replace(/"/g, '\\"');
}
