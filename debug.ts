import { source } from "./packages/envrw/src/index.js";

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const envPath = process.argv[2] ?? ".env.debug";
console.log(`Using env file: ${envPath}`);

const env = source(envPath);

await env.write({
	DEBUG: "true",
	COUNTER: "0",
});

console.log("Initial snapshot:", await env.read());

const stopAll = await env.listen(() => {
	console.log(`[${new Date().toISOString()}] env file changed`);
});

const stopDebug = await env.listen("DEBUG", (value) => {
	console.log(`[${new Date().toISOString()}] DEBUG ->`, value);
});

console.log("Performing updates...");
await env.write("DEBUG", `updated-${Date.now()}`);
await sleep(250);
await env.write("COUNTER", `${new Date().getSeconds()}`);
await sleep(250);

console.log("Current snapshot:", await env.read());
console.log("Listening for changes. Edit the file or press Ctrl+C to exit.\n");

let cleanedUp = false;
const cleanup = async () => {
	if (cleanedUp) {
		return;
	}
	cleanedUp = true;
	await Promise.allSettled([stopDebug(), stopAll()]);
	console.log("Listeners disposed. Goodbye!");
};

const handleSignal = (signal: NodeJS.Signals) => {
	console.log(`\nReceived ${signal}, shutting down...`);
	cleanup()
		.then(() => process.exit(0))
		.catch((error) => {
			console.error("Failed to cleanup listeners:", error);
			process.exit(1);
		});
};

process.once("SIGINT", handleSignal);
process.once("SIGTERM", handleSignal);
process.once("beforeExit", () => {
	if (!cleanedUp) {
		void cleanup();
	}
});

await new Promise(() => {
	/* keep process alive until signal */
});

