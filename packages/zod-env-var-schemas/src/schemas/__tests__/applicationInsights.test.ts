import { describe, expect, test } from "bun:test";
import { ZodError } from "zod";
import * as defaultSchemas from "../applicationInsights";
import * as v4Schemas from "../../v4/schemas/applicationInsights";
import * as v3Schemas from "../../v3/schemas/applicationInsights";

const expectZodMessage = (fn: () => unknown, message: string) => {
  try {
    fn();
    throw new Error("expected schema to reject value");
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
    if (error instanceof ZodError) {
      expect(error.issues[0]?.message).toBe(message);
    }
  }
};

const suites = [
  ["default (v4)", defaultSchemas],
  ["v4", v4Schemas],
  ["v3", v3Schemas],
] as const;

for (const [label, schemaSet] of suites) {
  const {
    APPINSIGHTS_AUTOCOLLECT_CONSOLE,
    APPINSIGHTS_AUTOCOLLECT_DEPENDENCIES,
    APPINSIGHTS_AUTOCOLLECT_EXCEPTIONS,
    APPINSIGHTS_AUTOCOLLECT_PERFORMANCE,
    APPINSIGHTS_INSTRUMENTATIONKEY,
    APPINSIGHTS_ROLE_NAME,
    APPINSIGHTS_SAMPLING_RATE,
    APPLICATIONINSIGHTS_CONNECTION_STRING,
  } = schemaSet;

  describe(`applicationInsights schemas (${label})`, () => {
  test("connection string requires full instrumentation details", () => {
    const valid = "InstrumentationKey=00000000-0000-0000-0000-000000000000;IngestionEndpoint=https://region.in.applicationinsights.azure.com/;LiveEndpoint=https://region.livediagnostics.monitor.azure.com/";
    expect(APPLICATIONINSIGHTS_CONNECTION_STRING.parse(valid)).toBe(valid);
    expectZodMessage(
      () => APPLICATIONINSIGHTS_CONNECTION_STRING.parse("invalid"),
      "Must be a valid Application Insights connection string format",
    );
  });

  test("instrumentation key must be a UUID", () => {
    const key = "123e4567-e89b-12d3-a456-426614174000";
    expect(APPINSIGHTS_INSTRUMENTATIONKEY.parse(key)).toBe(key);
    expectZodMessage(
      () => APPINSIGHTS_INSTRUMENTATIONKEY.parse("not-a-uuid"),
      "Must be a valid UUID format for instrumentation key",
    );
  });

  test("role name enforces length bounds", () => {
  expect(APPINSIGHTS_ROLE_NAME.parse("api-service")).toBe("api-service");
    expectZodMessage(() => APPINSIGHTS_ROLE_NAME.parse(""), "Role name cannot be empty");
    expectZodMessage(
      () => APPINSIGHTS_ROLE_NAME.parse("x".repeat(257)),
      "Role name must be less than 256 characters",
    );
  });

  test("sampling rate clamps between 0 and 100", () => {
    expect(APPINSIGHTS_SAMPLING_RATE.parse(50)).toBe(50);
    expect(APPINSIGHTS_SAMPLING_RATE.parse(undefined)).toBe(100);
    expectZodMessage(() => APPINSIGHTS_SAMPLING_RATE.parse(-1), "Sampling rate must be between 0 and 100");
  });

  test("auto-collection toggles default to true", () => {
    expect(APPINSIGHTS_AUTOCOLLECT_DEPENDENCIES.parse(undefined)).toBe(true);
    expect(APPINSIGHTS_AUTOCOLLECT_DEPENDENCIES.parse(false)).toBe(false);

    expect(APPINSIGHTS_AUTOCOLLECT_EXCEPTIONS.parse(undefined)).toBe(true);
    expect(APPINSIGHTS_AUTOCOLLECT_EXCEPTIONS.parse(true)).toBe(true);

    expect(APPINSIGHTS_AUTOCOLLECT_CONSOLE.parse(undefined)).toBe(true);
    expect(APPINSIGHTS_AUTOCOLLECT_CONSOLE.parse(false)).toBe(false);

    expect(APPINSIGHTS_AUTOCOLLECT_PERFORMANCE.parse(undefined)).toBe(true);
    expect(APPINSIGHTS_AUTOCOLLECT_PERFORMANCE.parse(true)).toBe(true);
  });
  });
}
