import EnvVarSource from "../index.ts";

const env = new EnvVarSource(".env");

await env.write({ APPNAME: `hey!
    another line...`, URL: "https://example.test" });

const value = await env.read("APPNAME");
const all = await env.read();
const selection = await env.read(["APPNAME", "URL", "MISSING"]);

console.log({ envPath: ".env", value, all, selection });