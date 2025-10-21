# ask-env

Interactive CLI for creating and editing `.env` files.

```ts
import { ask, schemas } from "ask-env";

const { NODE_ENV, PORT, OPENAI_API_KEY } = schemas;

await ask({ NODE_ENV, PORT, OPENAI_API_KEY });
```

## Schemas

Environment variable schemas can be supplied in three ways:

- Built-in schemas, such as `NODE_ENV`/`nodeEnv()`
- Custom Zod schemas, such as `z.string().min(3)`
- Custom definition objects, such as `{ type: "string", default: "debug" }`

## Channels

By default, values are written directly to the specified file path via [`envrw`](../envrw/README.md). Alternatively, values can be managed via `dotenv`:

```ts
await ask({ OPENAI_API_KEY }, { channel: dotenvx });
```

## Options

```typescript
await ask(schemas, {
  path: "./config/.env.local",
  truncate: 60,
  secrets: ["PAYMENT_SECRET", /token/i],
});
```

- `path`: override the `.env` file location (default: `.env`)
- `channel`: choose how values are read and written
- `truncate`: clamp long values in the UI (default: `40` characters)
- `secrets`: add or replace the masking patterns (default covers passwords, tokens, URLs, etc.)
- `theme`: provide a `picocolors` formatter (default: `magenta`)
