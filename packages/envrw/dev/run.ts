import { source } from "../index.ts";
import { join } from "desm";

const path = join(import.meta.url, "../../../.env");
const env = source(path);

const banner = [
  "Welcome to envrw!!",
  "This value spans",
  "many",
  "lines...",
].join("\n");

await env.write({ APPNAME: banner, URL: "https://example.test" });

const value = await env.read("APPNAME");
const all = await env.read();
const selection = await env.read(["APPNAME", "URL", "MISSING"]);
await env.write("DEBUG", "hey!");

console.log({ value, all, selection });
