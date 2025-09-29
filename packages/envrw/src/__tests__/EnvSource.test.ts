import { describe, expect, it, beforeEach, afterAll } from "bun:test";
import { mkdtemp, rm, writeFile, readFile } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { EnvSource } from "../EnvSource";

let workspaceDir: string;

beforeEach(async () => {
  if (!workspaceDir) {
    workspaceDir = await mkdtemp(join(tmpdir(), "envrw-"));
  }
});

afterAll(async () => {
  if (workspaceDir) {
    await rm(workspaceDir, { recursive: true, force: true });
  }
});

function filePath(name: string): string {
  return join(workspaceDir, name);
}

async function readFileContent(path: string): Promise<string> {
  try {
    return await readFile(path, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return "";
    }
    throw error;
  }
}

describe("EnvSource", () => {
  it("writes new keys into a fresh file", async () => {
    const target = filePath("fresh.env");
    const source = new EnvSource(target);

    await source.write("APPNAME", "demo-app");

    const content = await readFileContent(target);
    expect(content).toBe("APPNAME=demo-app\n");

    const readBack = await source.read();
    expect(readBack).toEqual({ APPNAME: "demo-app" });
  });

  it("maintains formatting when updating existing values", async () => {
    const target = filePath("format.env");
    await writeFile(
      target,
      ["APPNAME = \"Demo App\"", "URL=https://example.com", ""].join("\n"),
      "utf8"
    );

    const source = new EnvSource(target);
    await source.write("APPNAME", "Demo Two");

    const content = await readFileContent(target);
    expect(content).toBe(
      ["APPNAME = \"Demo Two\"", "URL=https://example.com", ""].join("\n")
    );

    const name = await source.read("APPNAME");
    expect(name).toBe("Demo Two");
  });

  it("preserves trailing comments when updating quoted values", async () => {
    const target = filePath("comments.env");
    await writeFile(target, 'DEBUG="true\\nyeah" # Testing\n', "utf8");

    const source = new EnvSource(target);
    await source.write("DEBUG", "hey");

    const content = await readFileContent(target);
    expect(content).toBe('DEBUG="hey" # Testing\n');
  });

  it("supports multi-key reads", async () => {
    const target = filePath("multi.env");
    await writeFile(
      target,
      [
        "APPNAME=demo",
        "URL=https://example.com",
        "EMPTY=",
        "FEATURE=true",
        "",
      ].join("\n"),
      "utf8"
    );

    const source = new EnvSource(target);
    const values = await source.read(["APPNAME", "URL", "MISSING", "EMPTY"]);

    expect(values).toEqual({
      APPNAME: "demo",
      URL: "https://example.com",
      MISSING: undefined,
      EMPTY: "",
    });
  });

  it("decodes quoted values on read", async () => {
    const target = filePath("quotes.env");
    await writeFile(
      target,
      ['PATH="/usr/local/bin"', 'SECRET="line\\nfeed"', "SAY='hello world'"].join(
        "\n"
      ),
      "utf8"
    );

    const source = new EnvSource(target);
    const secret = await source.read("SECRET");
    const say = await source.read("SAY");

    expect(secret).toBe("line\nfeed");
    expect(say).toBe("hello world");
  });

  it("appends new keys without disturbing existing spacing", async () => {
    const target = filePath("append.env");
    await writeFile(target, "APP=1\n", "utf8");

    const source = new EnvSource(target);
    await source.write({ URL: "https://example.com", FLAG: "true" });

    const content = await readFileContent(target);
    expect(content).toBe(
      ["APP=1", "URL=https://example.com", "FLAG=true", ""].join("\n")
    );
  });
});
