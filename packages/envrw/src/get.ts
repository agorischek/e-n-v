import type {
  EnvRecord,
  EnvSelectionRecord,
  ParsedAssignment,
} from "./types.ts";
import {
  normalizeContent,
  parseAssignmentEndingAt,
  splitLines,
  validateKey,
} from "./utils.ts";

export function get(content: string): EnvRecord;
export function get(content: string, name: string): string | undefined;
export function get<const Names extends readonly string[]>(
  content: string,
  names: Names,
): EnvSelectionRecord<Names>;
export function get(
  content: string,
  arg?: string | readonly string[],
): EnvRecord | string | undefined | Record<string, string | undefined> {
  const normalized = normalizeContent(content);
  const lines = splitLines(normalized);

  if (typeof arg === "undefined") {
    const map = scanAll(lines);
    return Object.fromEntries(map) as EnvRecord;
  }

  if (typeof arg === "string") {
    return scanForSingle(lines, arg);
  }

  const normalizedTargets = Array.from(
    new Set(arg.map((name) => validateKey(name))),
  );
  const lookup = scanForMany(lines, new Set(normalizedTargets));

  const ordered: [string, string | undefined][] = normalizedTargets.map(
    (key) => [key, lookup.get(key)],
  );
  return Object.fromEntries(ordered) as Record<string, string | undefined>;
}

function scanAll(lines: string[]): Map<string, string> {
  const result = new Map<string, string>();
  iterateAssignments(lines, (assignment) => {
    if (!result.has(assignment.key)) {
      result.set(assignment.key, assignment.value);
    }
  });
  return result;
}

function scanForSingle(lines: string[], target: string): string | undefined {
  const name = validateKey(target);
  let found: string | undefined;
  iterateAssignments(lines, (assignment) => {
    if (assignment.key === name) {
      found = assignment.value;
      return true;
    }
    return undefined;
  });
  return found;
}

function scanForMany(
  lines: string[],
  targets: Set<string>,
): Map<string, string> {
  const normalizedTargets = new Set<string>();
  for (const target of targets) {
    normalizedTargets.add(validateKey(target));
  }

  const found = new Map<string, string>();
  const remaining = new Set(normalizedTargets);

  iterateAssignments(lines, (assignment) => {
    if (!remaining.has(assignment.key) || found.has(assignment.key)) {
      return;
    }

    found.set(assignment.key, assignment.value);
    remaining.delete(assignment.key);

    if (remaining.size === 0) {
      return true;
    }
    return undefined;
  });

  return found;
}

function iterateAssignments(
  lines: string[],
  callback: (assignment: ParsedAssignment) => boolean | void | undefined,
): void {
  for (let i = lines.length - 1; i >= 0; ) {
    const parsed = parseAssignmentEndingAt(lines, i);
    if (!parsed) {
      i -= 1;
      continue;
    }

    const shouldStop = callback(parsed);
    if (shouldStop === true) {
      return;
    }

    i = parsed.startIndex - 1;
  }
}
