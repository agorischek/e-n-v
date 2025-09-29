import { mkdir, readFile, writeFile } from "fs/promises";
import { dirname } from "path";
import {
  ParsedAssignment,
  ParsedComment,
  ParsedLine,
  ParsedUnknown,
  parseEnvDocument,
} from "./envParser";
import {
  decodeValue,
  escapeDoubleQuoted,
  needsQuoting,
  splitValueComment,
} from "./valueUtils";

type LineGroup =
  | AssignmentGroup
  | SectionGroup
  | UnknownGroup
  | BlankGroup;

interface AssignmentGroup {
  type: "assignment";
  assignment: ParsedAssignment;
  comments: ParsedComment[];
  index: number;
}

interface SectionGroup {
  type: "section";
  comments: ParsedComment[];
  index: number;
}

interface UnknownGroup {
  type: "unknown";
  raw: string;
  index: number;
}

interface BlankGroup {
  type: "blank";
  index: number;
}

export function formatEnvContent(content: string): string {
  const document = parseEnvDocument(content);
  const groups = buildGroups(document.lines);
  const filtered = filterDuplicateAssignments(groups);
  const lines = renderGroups(filtered);
  if (lines.length === 0) {
    return "";
  }
  return `${lines.join("\n")}\n`;
}

export const formatEnv = formatEnvContent;

export async function formatEnvFile(filePath: string): Promise<void> {
  let original = "";
  try {
    original = await readFile(filePath, "utf8");
  } catch (error) {
    if (!isNotFoundError(error)) {
      throw error;
    }
    return;
  }

  const formatted = formatEnvContent(original);
  if (formatted === original) {
    return;
  }

  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, formatted, "utf8");
}

function buildGroups(lines: ParsedLine[]): LineGroup[] {
  const groups: LineGroup[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    if (!line) {
      break;
    }

    if (line.kind === "blank") {
      groups.push({ type: "blank", index });
      index += 1;
      continue;
    }

    if (line.kind === "comment") {
      const comments: ParsedComment[] = [line as ParsedComment];
      let cursor = index + 1;
      while (cursor < lines.length) {
        const nextLine = lines[cursor];
        if (!nextLine || nextLine.kind !== "comment") {
          break;
        }
        comments.push(nextLine as ParsedComment);
        cursor += 1;
      }

      const nextLine = lines[cursor];

      if (nextLine && nextLine.kind === "assignment") {
        groups.push({
          type: "assignment",
          assignment: nextLine as ParsedAssignment,
          comments,
          index,
        });
        index = cursor + 1;
        continue;
      }

      groups.push({ type: "section", comments, index });
      index = cursor;
      continue;
    }

    if (line.kind === "assignment") {
      const assignment = line as ParsedAssignment;
      groups.push({
        type: "assignment",
        assignment,
        comments: [],
        index,
      });
      index += 1;
      continue;
    }

    groups.push({
      type: "unknown",
      raw: (line as ParsedUnknown).raw,
      index,
    });
    index += 1;
  }

  return groups;
}

function filterDuplicateAssignments(groups: LineGroup[]): LineGroup[] {
  const lastIndex = new Map<string, number>();
  groups.forEach((group, index) => {
    if (group.type === "assignment") {
      lastIndex.set(group.assignment.key, index);
    }
  });

  const carried = new Map<string, ParsedComment[]>();
  const result: LineGroup[] = [];

  for (let index = 0; index < groups.length; index += 1) {
    const group = groups[index];
    if (!group) {
      continue;
    }

    if (group.type !== "assignment") {
      result.push(group);
      continue;
    }

    const key = group.assignment.key;
    const targetIndex = lastIndex.get(key);

    if (targetIndex === undefined) {
      result.push(group);
      continue;
    }

    if (index !== targetIndex) {
      if (group.comments.length > 0) {
        const existing = carried.get(key) ?? [];
        carried.set(key, [...existing, ...group.comments]);
      }
      continue;
    }

    const leading = carried.get(key);
    if (leading && leading.length > 0) {
      result.push({
        type: "assignment",
        assignment: group.assignment,
        comments: [...leading, ...group.comments],
        index: group.index,
      });
      carried.delete(key);
    } else {
      result.push(group);
    }
  }

  return result;
}

function renderGroups(groups: LineGroup[]): string[] {
  const lines: string[] = [];

  const pushBlank = () => {
    if (lines.length === 0) {
      return;
    }
    if (lines[lines.length - 1] === "") {
      return;
    }
    lines.push("");
  };

  groups.forEach((group) => {
    switch (group.type) {
      case "blank": {
        pushBlank();
        break;
      }
      case "section": {
        if (lines.length > 0) {
          pushBlank();
        }
        for (const comment of group.comments) {
          lines.push(comment.commentToken.image);
        }
        pushBlank();
        break;
      }
      case "assignment": {
        if (group.comments.length > 0) {
          if (lines.length > 0 && lines[lines.length - 1] !== "") {
            lines.push("");
          }
          for (const comment of group.comments) {
            lines.push(comment.commentToken.image);
          }
        }
        lines.push(formatAssignmentLine(group.assignment));
        break;
      }
      case "unknown": {
        const trimmed = stripTrailingNewline(group.raw);
        if (trimmed.length === 0) {
          pushBlank();
        } else {
          lines.push(trimmed);
        }
        break;
      }
    }
  });

  return trimBlankEdges(condenseBlankLines(lines));
}

function formatAssignmentLine(assignment: ParsedAssignment): string {
  const { commentPart } = splitValueComment(assignment.valueText);
  const decoded = decodeValue(assignment.valueText);
  const formattedValue = needsQuoting(decoded)
    ? `"${escapeDoubleQuoted(decoded)}"`
    : decoded;
  const valueSegment = formattedValue.length > 0 ? formattedValue : "";
  const exportPrefix = assignment.exportToken ? "export " : "";
  return `${exportPrefix}${assignment.key}=${valueSegment}${commentPart}`;
}

function condenseBlankLines(lines: string[]): string[] {
  const output: string[] = [];
  for (const line of lines) {
    if (line === "") {
      if (output.length === 0 || output[output.length - 1] === "") {
        continue;
      }
    }
    output.push(line);
  }
  return output;
}

function trimBlankEdges(lines: string[]): string[] {
  let start = 0;
  while (start < lines.length && lines[start] === "") {
    start += 1;
  }

  let end = lines.length - 1;
  while (end >= start && lines[end] === "") {
    end -= 1;
  }

  return lines.slice(start, end + 1);
}

function stripTrailingNewline(value: string): string {
  return value.replace(/\r?\n$/, "");
}

function isNotFoundError(error: unknown): boolean {
  return Boolean(
    error &&
      typeof error === "object" &&
      "code" in error &&
      (error as NodeJS.ErrnoException).code === "ENOENT"
  );
}
