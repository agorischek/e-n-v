import { describe, expect, it, beforeEach, afterAll } from "bun:test";
import { mkdtemp, readFile, rm, writeFile } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { EnvSource } from "../EnvSource";
import { formatEnvContent, formatEnvFile } from "../formatEnv";

let workspaceDir: string;

beforeEach(async () => {
  if (!workspaceDir) {
    workspaceDir = await mkdtemp(join(tmpdir(), "envrw-format-"));
  }
});

afterAll(async () => {
  if (workspaceDir) {
    await rm(workspaceDir, { recursive: true, force: true });
  }
});

describe("formatEnvContent", () => {
  it("deduplicates keys while preserving earlier comments", () => {
    const input = [
      "BAR=keep",
      "# comment before first",
      "FOO=old",
      "# comment before final",
      "FOO=new",
      "",
    ].join("\n");

    const expected = [
      "BAR=keep",
      "",
      "# comment before first",
      "# comment before final",
      "FOO=new",
      "",
    ].join("\n");

    expect(formatEnvContent(input)).toBe(expected);
  });

  it("keeps section comments separated by blank lines", () => {
    const input = [
      "# Database",
      "",
      "DB_HOST=localhost",
      "DB_PASS=secret",
      "",
      "# Cache",
      "# Secondary",
      "",
      "REDIS_URL=redis://localhost",
      "",
    ].join("\n");

    const expected = [
      "# Database",
      "",
      "DB_HOST=localhost",
      "DB_PASS=secret",
      "",
      "# Cache",
      "# Secondary",
      "",
      "REDIS_URL=redis://localhost",
      "",
    ].join("\n");

    expect(formatEnvContent(input)).toBe(expected);
  });

  it("quotes values that require quoting and preserves inline comments", () => {
    const input = [
      "APP_NAME=demo app # keep me",
      "URL=https://example.com",
      "PASSWORD=pa$$ word",
      "NOTE=\"already quoted\"",
      "EXPORT_ME=\" spaced \"",
  "export JSON={\"key\":\"value\"}",
      "",
    ].join("\n");

    const expected = [
      "APP_NAME=\"demo app\" # keep me",
      "URL=https://example.com",
      "PASSWORD=\"pa$$ word\"",
      "NOTE=\"already quoted\"",
      "EXPORT_ME=\" spaced \"",
  "export JSON=\"{\\\"key\\\":\\\"value\\\"}\"",
      "",
    ].join("\n");

    expect(formatEnvContent(input)).toBe(expected);
  });

  it("retains unknown lines verbatim", () => {
    const input = [
      "set -o pipefail",
      "FOO=bar",
      "",
    ].join("\n");

    const expected = [
      "set -o pipefail",
      "FOO=bar",
      "",
    ].join("\n");

    expect(formatEnvContent(input)).toBe(expected);
  });
});

describe("formatEnvFile", () => {
  it("formats files on disk and ignores missing files", async () => {
    const target = join(workspaceDir, "format-target.env");
    const input = [
      "A=one",
      "# comment",
      "A=two",
      "",
    ].join("\n");

    await writeFile(target, input, "utf8");
    await formatEnvFile(target);

    const contents = await readFile(target, "utf8");
    const expected = [
      "# comment",
      "A=two",
      "",
    ].join("\n");

    expect(contents).toBe(expected);

    const missing = join(workspaceDir, "missing.env");
    await expect(formatEnvFile(missing)).resolves.toBeUndefined();
  });
});

describe("EnvSource.format", () => {
  it("writes formatted content back to disk", async () => {
    const target = join(workspaceDir, "format-me.env");
    await writeFile(
      target,
      [
        "# Intro",
        "DUP=one",
        "# description",
        "DUP=two",
        "",
        "NAME=hello world",
        "",
      ].join("\n"),
      "utf8"
    );

    const source = new EnvSource(target);
    await source.format();

    const formatted = await readFile(target, "utf8");
    const expected = [
      "# Intro",
      "# description",
      "DUP=two",
      "",
      "NAME=\"hello world\"",
      "",
    ].join("\n");

    expect(formatted).toBe(expected);
  });
});
