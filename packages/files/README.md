<!-- markdownlint-disable-next-line -->
<img src="./assets/envrw-logo2.png" alt="Ask Env Logo" height="50"/>

# e·n·v Files

A read/write API for `.env` files.

## Usage

```ts
import { source } from "envrw";

const env = source(".env");

const all = await env.read();
// → { APPNAME: "envrw-dev", URL: "https://example.test", PORT: "3000" }

const name = await env.read("APPNAME");
// → "envrw-dev"

const selection = await env.read(["APPNAME", "URL"]);
// → { APPNAME: "envrw-dev", URL: "https://example.test" }

await env.write("APPNAME", "envrw-prod");
// APPNAME=envrw-prod

await env.write({ URL: "https://prod.example" });
// URL=https://prod.example

await env.write("MULTILINE", "Line one\nLine two\nLine three");
// MULTILINE="Line one
// Line two
// Line three"
```

### Behavior

- Reads scan the file from the end toward the top and short-circuit once requested variables are found.
- Writes replace the last occurrence of each variable in-place; if a variable does not exist, it is appended to the end of the file.
- Comments are preserved.
- Values containing whitespace, quotes, backslashes, comment markers, or literal newlines are automatically wrapped in double quotes. Real newlines are emitted as-is (no `\n` escaping).
- Files are always written with a trailing newline for POSIX friendliness.
- Relative paths resolve from the current working directory at runtime.

### Text

The package also exposes pure helpers for working with `.env` text without filesystem interaction.

- `get(content, key?)` mirrors the async `read` overloads and returns either the full record, a single value, or a selection.
- `set(content, key, value)` / `set(content, record)` returns a new string with the requested updates applied.

```ts
import { get, set } from "envrw";

const text = "FOO=1\nBAR=2\n";
const record = get(text);
// → { FOO: "1", BAR: "2" }

const next = set(text, { BAR: "3", BAZ: "4" });
// → 'FOO=1\nBAR=3\nBAZ=4\n'
```
