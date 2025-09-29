import { file } from "envrw";

const env = envrw(".env");

await env.read();
await env.write(
  {
    NEW_VAR: "new_value",
  },
  { patch: false }
);

await env.get("NEW_VAR"); // "new_value"
await env.set("NEW_VAR", "updated_value");

await get(".env", "NEW_VAR"); // "updated_value"
