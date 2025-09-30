# envrw

A read/write API for `.env` files.


## Installation

```bash
bun add envrw
```

## Usage

```ts
import EnvVarSource, { source } from "envrw";

const env = source(".env");

const all = await env.read();
// → { APPNAME: "envrw-dev", URL: "https://example.test" }

const name = await env.read("APPNAME");
// → "envrw-dev"

const selection = await env.read(["APPNAME", "URL"]);
// → { APPNAME: "envrw-dev", URL: "https://example.test" }

await env.write("APPNAME", "envrw-prod");
await env.write({ URL: "https://prod.example" });

await env.write("BANNER", "Line one\nLine two\nLine three");
// File now contains:
// BANNER="Line one
// Line two
// Line three"
```

### Behavior

- Reads scan the file from the end toward the top and short-circuit once they find the requested variable(s).
- Writes replace the last occurrence of each variable in-place; if a variable does not exist, it is appended to the end of the file.
- Values containing whitespace, quotes, backslashes, comment markers, or literal newlines are automatically wrapped in double quotes. Real newlines are emitted as-is (no `\n` escaping).
- Files are always written with a trailing newline for POSIX friendliness.

### Convenience factory

- `source(path = ".env")` simply returns `new EnvVarSource(path)` if you prefer a terse helper.

### Synchronous parsing with `EnvContent`

- `EnvContent.from(string)` creates an in-memory representation of `.env` content. The synchronous `get` and `set` methods mirror the `read`/`write` APIs when you don't need filesystem access.

```ts
import { EnvContent } from "envrw";

const content = EnvContent.from("FOO=1\nBAR=2\n");
const record = content.get();
// → { FOO: "1", BAR: "2" }

content.set({ BAR: "3", BAZ: "4" });
content.set("EXTRA", "value");

const next = content.toString();
// → 'FOO=1\nBAR=3\nBAZ=4\nEXTRA=value\n'
```

### Notes

- The API is intentionally tiny—there are no configuration options, expansion rules, or comment preservation.
- The class accepts either relative or absolute paths. Relative paths resolve from the current working directory at runtime.
