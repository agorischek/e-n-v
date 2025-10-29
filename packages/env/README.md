<!-- markdownlint-disable-next-line -->
<img src="https://raw.githubusercontent.com/agorischek/e-n-v/main/static/logos/e-n-v.png" alt="e-n-v Logo" height="55"/>

> Environments, niftily? Very!

e·n·v is a suite of handy stuff for working with environment variables and `.env` files, including interactive setup and runtime validation.

```ts
// Define environment variables
const model = define({
  schemas: { NODE_ENV, DATABASE_URL, PORT },
});
```

```ts
// Set up during development
await prompt(model); // or use `e-n-v setup`
```

```ts
// Validate at runtime
const env = parse(process.env, model);
```

<!-- markdownlint-disable-next-line -->
<img src="https://vhs.charm.sh/vhs-5fQTwW2FbZA42LNteIXA38.gif" alt="Demo" width="500"/>

## Usage

### 1. Define your model

An env model defines the structure of your environment variables, including names, schemas, and any preprocessing (e.g. converting `1`/`0` to boolean). This model is used both for development-time setup and runtime validation. e·n·v provides built-in schemas for common variables, and custom schemas can be authored using Zod.

```ts
// env.model.js

import { define, schemas } from "e-n-v";

const { NODE_ENV, DATABASE_URL, PORT } = schemas;

export default define({
  schemas: { NODE_ENV, DATABASE_URL, PORT },
});
```

### 2. Set up for development

Run `e-n-v setup` to interactively author your local `.env` file during development. This can be wrapped in a package script, e.g. `npm run env`. (Alternatively, a `prompt` method is available for programmatic use.)

### 3. Parse at runtime

In your app, load your environment variables as usual, parse them, and export them for use. A combined error is thrown if any variables fail validation. Reference these exports throughout your code rather than using `process.env` directly.

```ts
// env.vars.js

import "dotenv/config";
import { parse } from "e-n-v";
import model from "./env.model";

export const { NODE_ENV, PORT, DATABASE_URL } = parse(process.env, model);
```

### 4. Customize

e·n·v provides a variety of customization options, including:

1. Authoring custom variable schemas using Zod or built-in schema utilities.
2. Reading and writing variables via other libraries, e.g. `dotenvx`.
3. Changing the setup CLI behavior, such as what variables are treated as secrets.

Happy configuration!
