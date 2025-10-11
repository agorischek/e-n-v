// Use this file for interactive testing of Zod internals.
import z3 from "zod";
import * as z4 from "zod/v4";

type AnySchema = Record<string, unknown> & {
	_def?: Record<string, unknown>;
	_zod?: { def?: Record<string, unknown> };
	description?: string;
};

function getDef(schema: AnySchema): Record<string, unknown> | undefined {
	if (schema._zod && typeof schema._zod.def === "object") {
		return schema._zod.def as Record<string, unknown>;
	}
	if (schema._def && typeof schema._def === "object") {
		return schema._def as Record<string, unknown>;
	}
	return undefined;
}

function inspectSchema(label: string, schema: AnySchema): void {
	const def = getDef(schema);
	console.log(`\n=== ${label} ===`);
	console.log("has _def", Boolean(schema._def));
	console.log("has _zod", Boolean(schema._zod));
	console.log("description", schema.description);
			const metaFn = (schema as { meta?: () => unknown }).meta;
			if (typeof metaFn === "function") {
				console.log("meta()", metaFn.call(schema));
		}
	if (!def) {
		console.log("no def available");
		return;
	}
	const keys = Object.keys(def).sort();
	console.log("def keys", keys);
	console.log("def.type", def.type);
	console.log("def.typeName", def.typeName);

	if ("innerType" in def) {
		console.log("has innerType", true);
		const inner = (def as Record<string, AnySchema>).innerType;
		if (inner) {
			console.log(
				"inner constructor",
				Object.getPrototypeOf(inner)?.constructor?.name ?? "unknown"
			);
		}
	}

			if ("checks" in def && Array.isArray(def.checks)) {
				const checks = (def.checks as Record<string, unknown>[]).map((check) => {
					const protoName = Object.getPrototypeOf(check)?.constructor?.name ?? "unknown";
					const keys = Object.getOwnPropertyNames(check).sort();
					const zodMeta = (check as { _zod?: { def?: Record<string, unknown> } })._zod;
					return {
						proto: protoName,
						keys,
								defKeys: zodMeta?.def ? Object.keys(zodMeta.def).sort() : undefined,
								zodDef: zodMeta?.def,
						value: (check as Record<string, unknown>).value,
					};
				});
				console.log("checks", checks);
			}

		if ("defaultValue" in def) {
			const defaultValue = (def as { defaultValue?: unknown }).defaultValue;
			console.log("defaultValue type", typeof defaultValue);
			console.log("defaultValue", defaultValue);
	}

	if ("values" in def) {
		console.log("values", def.values);
	}

		if ("entries" in def) {
			console.log("entries", def.entries);
		}

			if ("in" in def) {
				console.log("def.in type", typeof (def as { in?: unknown }).in);
			}

			if ("out" in def) {
				console.log("def.out type", typeof (def as { out?: unknown }).out);
			}
}

async function main(): Promise<void> {
	const z3String = z3.string().describe("z3 string").min(2).max(5);
	const z3Optional = z3String.optional();
	const z3Default = z3String.default("foo");
	const z3Enum = z3.enum(["a", "b", "c"]).describe("z3 enum");
		const z3Transformed = z3.string().transform((value) => value).describe("z3 transform");
			const z3Pipeline = z3.string().pipe(z3.number());

	const z4String = z4.z.string().describe("z4 string").min(2).max(5);
	const z4Optional = z4String.optional();
	const z4Default = z4String.default("bar");
	const z4Enum = z4.z.enum(["x", "y"]).describe("z4 enum");
		const z4Transformed = z4.z.string().transform((value) => value).describe("z4 transform");
		const z4Number = z4.z.number().min(1).max(9);

	inspectSchema("z3 string", z3String as unknown as AnySchema);
	inspectSchema("z3 optional", z3Optional as unknown as AnySchema);
	inspectSchema("z3 default", z3Default as unknown as AnySchema);
	inspectSchema("z3 enum", z3Enum as unknown as AnySchema);
		inspectSchema("z3 transform", z3Transformed as unknown as AnySchema);
		inspectSchema("z3 pipe", z3Pipeline as unknown as AnySchema);

	inspectSchema("z4 string", z4String as unknown as AnySchema);
	inspectSchema("z4 optional", z4Optional as unknown as AnySchema);
	inspectSchema("z4 default", z4Default as unknown as AnySchema);
	inspectSchema("z4 enum", z4Enum as unknown as AnySchema);
		inspectSchema("z4 transform", z4Transformed as unknown as AnySchema);
		inspectSchema("z4 number", z4Number as unknown as AnySchema);

	const z4coreModule: Record<string, unknown> = await import("zod/v4/core");
	console.log("\n=== z4 core keys ===");
	console.log(Object.keys(z4coreModule).sort());

	const getString = z4coreModule.string as undefined | (() => unknown);
	if (typeof getString === "function") {
		const coreString = getString();
		inspectSchema("z4 core string", coreString as unknown as AnySchema);
	}
}

main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});