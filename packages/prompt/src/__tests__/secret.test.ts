import { describe, expect, it } from "bun:test";
import { maskSecretValue, isSecretKey } from "../utils/secrets";
import { SECRET_MASK } from "../visuals/symbols";
import { SECRET_PATTERNS } from "../options/defaults";

describe("secret utilities", () => {
  it("masks values using the default mask", () => {
    expect(maskSecretValue("hunter2")).toBe(SECRET_MASK.repeat(7));
  });

  it("masks values using a custom mask character", () => {
    expect(maskSecretValue("hunter2", "*")).toBe("*******");
  });

  it("detects secrets by key using default patterns", () => {
    expect(isSecretKey("API_KEY", undefined, SECRET_PATTERNS)).toBe(true);
    expect(isSecretKey("PUBLIC_URL", undefined, SECRET_PATTERNS)).toBe(false);
  });

  it("detects secrets based on descriptions", () => {
    expect(
      isSecretKey(
        "SOME_VALUE",
        "Used as the OAuth client secret",
        SECRET_PATTERNS,
      ),
    ).toBe(true);
  });

  it("respects user-provided patterns", () => {
    const patterns = [/custom/i];
    expect(isSecretKey("CUSTOM_TOKEN", undefined, patterns)).toBe(true);
    expect(isSecretKey("API_KEY", undefined, patterns)).toBe(false);
  });

  it("returns false when no patterns are provided", () => {
    expect(isSecretKey("ANYTHING", undefined, [])).toBe(false);
  });
});

describe("SECRET_PATTERNS", () => {
  describe("should match secret keys", () => {
    it.each([
      // password
      ["PASSWORD"],
      ["DB_PASSWORD"],
      ["USER_PASSWORD"],
      // passphrase
      ["PASSPHRASE"],
      ["GPG_PASSPHRASE"],
      // secret
      ["SECRET"],
      ["CLIENT_SECRET"],
      ["APP_SECRET"],
      // token (actual secrets)
      ["TOKEN"],
      ["API_TOKEN"],
      ["AUTH_TOKEN"],
      ["ACCESS_TOKEN"],
      ["REFRESH_TOKEN"],
      ["JWT_ACCESS_TOKEN"],
      // api key
      ["API_KEY"],
      ["APIKEY"],
      ["API-KEY"],
      ["STRIPE_API_KEY"],
      // client secret
      ["CLIENTSECRET"],
      ["CLIENT-SECRET"],
      ["OAUTH_CLIENT_SECRET"],
      // private key
      ["PRIVATE_KEY"],
      ["PRIVATEKEY"],
      ["PRIVATE-KEY"],
      ["SSH_PRIVATE_KEY"],
      // database connections
      ["DATABASE_URL"],
      ["DATABASE_CONNECTION_STRING"],
      ["DB_URL"],
      ["DB_CONNECTION_STRING"],
      ["REDIS_URL"],
      ["REDIS_CONNECTION_STRING"],
      ["MONGO_URL"],
      ["MONGODB_CONNECTION_STRING"],
      ["SQL_URL"],
      ["POSTGRES_URL"],
      ["MYSQL_CONNECTION_STRING"],
      ["DATABASEURL"],
      ["DATABASE-URL"],
      ["DB_CONNECTION-STRING"],
      ["REDIS-CONNECTION_STRING"],
      // access key
      ["ACCESS_KEY"],
      ["ACCESSKEY"],
      ["ACCESS-KEY"],
      ["AWS_ACCESS_KEY"],
      // credential
      ["CREDENTIAL"],
      ["CREDENTIALS"],
      ["SERVICE_CREDENTIAL"],
      // case insensitive
      ["api_key"],
      ["Api_Key"],
      ["token"],
      ["Token"],
      ["password"],
      ["Password"],
    ])("should match '%s'", (key) => {
      expect(isSecretKey(key, undefined, SECRET_PATTERNS)).toBe(true);
    });
  });

  describe("should NOT match non-secret keys", () => {
    it.each([
      // token expiration/lifetime configurations
      ["TOKEN_EXPIRES"],
      ["TOKEN_EXPIRY"],
      ["TOKEN_EXPIRATION"],
      ["TOKEN_TTL"],
      ["TOKEN_LIFETIME"],
      ["TOKEN_DURATION"],
      ["TOKEN_AGE"],
      ["TOKEN_MAX_AGE"],
      ["TOKEN_VALIDITY"],
      ["JWT_ACCESS_TOKEN_EXPIRES_IN"],
      ["JWT_REFRESH_TOKEN_EXPIRES_IN"],
      ["ACCESS_TOKEN_EXPIRATION"],
      ["REFRESH_TOKEN_TTL"],
      ["TOKEN_EXPIRES_IN"],
      ["TOKEN-EXPIRES-IN"],
      ["EXPIRES_IN_TOKEN"],
      ["EXPIRESIN_TOKEN"],
      // common non-secret variables
      ["PORT"],
      ["HOST"],
      ["NODE_ENV"],
      ["PUBLIC_URL"],
      ["APP_NAME"],
      ["LOG_LEVEL"],
      ["TIMEOUT"],
      ["MAX_RETRIES"],
    ])("should NOT match '%s'", (key) => {
      expect(isSecretKey(key, undefined, SECRET_PATTERNS)).toBe(false);
    });
  });
});
