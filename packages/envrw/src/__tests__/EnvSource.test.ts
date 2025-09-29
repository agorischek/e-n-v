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

function createDeferred<T = void>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

function waitFor(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
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

  it("invokes listeners on any change", async () => {
    const target = filePath("listen-all.env");
    await writeFile(target, "DEBUG=true\n", "utf8");

    const source = new EnvSource(target);
    const deferred = createDeferred<void>();
    const dispose = await source.listen(() => {
      deferred.resolve();
    });

    const timeout = setTimeout(() => {
      deferred.reject(new Error("listener timeout"));
    }, 2_000);

    await source.write("DEBUG", "false");

    await deferred.promise;
    clearTimeout(timeout);
    await dispose();
  });

  it("invokes key-specific listeners only for matching changes", async () => {
    const target = filePath("listen-key.env");
    await writeFile(target, ["DEBUG=1", "OTHER=2", ""].join("\n"), "utf8");

    const source = new EnvSource(target);
    const values: Array<string | undefined> = [];
    const deferred = createDeferred<string | undefined>();
    const dispose = await source.listen("DEBUG", (value) => {
      values.push(value);
      if (values.length === 1) {
        deferred.resolve(value);
      }
    });

    await source.write("OTHER", "3");
    await waitFor(200);
    expect(values).toHaveLength(0);

    const timeout = setTimeout(() => {
      deferred.reject(new Error("listener timeout"));
    }, 2_000);

    await source.write("DEBUG", "4");

    const value = await deferred.promise;
    clearTimeout(timeout);
    expect(value).toBe("4");
    expect(values).toEqual(["4"]);

    await dispose();
  });
});
