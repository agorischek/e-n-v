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
  describe("password pattern", () => {
    it("matches password variations", () => {
      expect(isSecretKey("PASSWORD", undefined, SECRET_PATTERNS)).toBe(true);
      expect(isSecretKey("DB_PASSWORD", undefined, SECRET_PATTERNS)).toBe(true);
      expect(isSecretKey("USER_PASSWORD", undefined, SECRET_PATTERNS)).toBe(true);
    });
  });

  describe("passphrase pattern", () => {
    it("matches passphrase variations", () => {
      expect(isSecretKey("PASSPHRASE", undefined, SECRET_PATTERNS)).toBe(true);
      expect(isSecretKey("GPG_PASSPHRASE", undefined, SECRET_PATTERNS)).toBe(true);
    });
  });

  describe("secret pattern", () => {
    it("matches secret variations", () => {
      expect(isSecretKey("SECRET", undefined, SECRET_PATTERNS)).toBe(true);
      expect(isSecretKey("CLIENT_SECRET", undefined, SECRET_PATTERNS)).toBe(true);
      expect(isSecretKey("APP_SECRET", undefined, SECRET_PATTERNS)).toBe(true);
    });
  });

  describe("token pattern", () => {
    it("matches token variations that are secrets", () => {
      expect(isSecretKey("TOKEN", undefined, SECRET_PATTERNS)).toBe(true);
      expect(isSecretKey("API_TOKEN", undefined, SECRET_PATTERNS)).toBe(true);
      expect(isSecretKey("AUTH_TOKEN", undefined, SECRET_PATTERNS)).toBe(true);
      expect(isSecretKey("ACCESS_TOKEN", undefined, SECRET_PATTERNS)).toBe(true);
      expect(isSecretKey("REFRESH_TOKEN", undefined, SECRET_PATTERNS)).toBe(true);
      expect(isSecretKey("JWT_ACCESS_TOKEN", undefined, SECRET_PATTERNS)).toBe(true);
    });

    it("does not match token expiration/lifetime configurations", () => {
      expect(isSecretKey("TOKEN_EXPIRES", undefined, SECRET_PATTERNS)).toBe(false);
      expect(isSecretKey("TOKEN_EXPIRY", undefined, SECRET_PATTERNS)).toBe(false);
      expect(isSecretKey("TOKEN_EXPIRATION", undefined, SECRET_PATTERNS)).toBe(false);
      expect(isSecretKey("TOKEN_TTL", undefined, SECRET_PATTERNS)).toBe(false);
      expect(isSecretKey("TOKEN_LIFETIME", undefined, SECRET_PATTERNS)).toBe(false);
      expect(isSecretKey("TOKEN_DURATION", undefined, SECRET_PATTERNS)).toBe(false);
      expect(isSecretKey("TOKEN_AGE", undefined, SECRET_PATTERNS)).toBe(false);
      expect(isSecretKey("TOKEN_MAX_AGE", undefined, SECRET_PATTERNS)).toBe(false);
      expect(isSecretKey("TOKEN_VALIDITY", undefined, SECRET_PATTERNS)).toBe(false);
      expect(isSecretKey("JWT_ACCESS_TOKEN_EXPIRES_IN", undefined, SECRET_PATTERNS)).toBe(false);
      expect(isSecretKey("JWT_REFRESH_TOKEN_EXPIRES_IN", undefined, SECRET_PATTERNS)).toBe(false);
      expect(isSecretKey("ACCESS_TOKEN_EXPIRATION", undefined, SECRET_PATTERNS)).toBe(false);
      expect(isSecretKey("REFRESH_TOKEN_TTL", undefined, SECRET_PATTERNS)).toBe(false);
    });

    it("handles variations with underscores and hyphens", () => {
      expect(isSecretKey("TOKEN_EXPIRES_IN", undefined, SECRET_PATTERNS)).toBe(false);
      expect(isSecretKey("TOKEN-EXPIRES-IN", undefined, SECRET_PATTERNS)).toBe(false);
      expect(isSecretKey("EXPIRES_IN_TOKEN", undefined, SECRET_PATTERNS)).toBe(false);
      expect(isSecretKey("EXPIRESIN_TOKEN", undefined, SECRET_PATTERNS)).toBe(false);
    });
  });

  describe("api key pattern", () => {
    it("matches api key variations", () => {
      expect(isSecretKey("API_KEY", undefined, SECRET_PATTERNS)).toBe(true);
      expect(isSecretKey("APIKEY", undefined, SECRET_PATTERNS)).toBe(true);
      expect(isSecretKey("API-KEY", undefined, SECRET_PATTERNS)).toBe(true);
      expect(isSecretKey("STRIPE_API_KEY", undefined, SECRET_PATTERNS)).toBe(true);
    });
  });

  describe("client secret pattern", () => {
    it("matches client secret variations", () => {
      expect(isSecretKey("CLIENT_SECRET", undefined, SECRET_PATTERNS)).toBe(true);
      expect(isSecretKey("CLIENTSECRET", undefined, SECRET_PATTERNS)).toBe(true);
      expect(isSecretKey("CLIENT-SECRET", undefined, SECRET_PATTERNS)).toBe(true);
      expect(isSecretKey("OAUTH_CLIENT_SECRET", undefined, SECRET_PATTERNS)).toBe(true);
    });
  });

  describe("private key pattern", () => {
    it("matches private key variations", () => {
      expect(isSecretKey("PRIVATE_KEY", undefined, SECRET_PATTERNS)).toBe(true);
      expect(isSecretKey("PRIVATEKEY", undefined, SECRET_PATTERNS)).toBe(true);
      expect(isSecretKey("PRIVATE-KEY", undefined, SECRET_PATTERNS)).toBe(true);
      expect(isSecretKey("SSH_PRIVATE_KEY", undefined, SECRET_PATTERNS)).toBe(true);
    });
  });

  describe("database connection patterns", () => {
    it("matches database connection strings and URLs", () => {
      expect(isSecretKey("DATABASE_URL", undefined, SECRET_PATTERNS)).toBe(true);
      expect(isSecretKey("DATABASE_CONNECTION_STRING", undefined, SECRET_PATTERNS)).toBe(true);
      expect(isSecretKey("DB_URL", undefined, SECRET_PATTERNS)).toBe(true);
      expect(isSecretKey("DB_CONNECTION_STRING", undefined, SECRET_PATTERNS)).toBe(true);
      expect(isSecretKey("REDIS_URL", undefined, SECRET_PATTERNS)).toBe(true);
      expect(isSecretKey("REDIS_CONNECTION_STRING", undefined, SECRET_PATTERNS)).toBe(true);
      expect(isSecretKey("MONGO_URL", undefined, SECRET_PATTERNS)).toBe(true);
      expect(isSecretKey("MONGODB_CONNECTION_STRING", undefined, SECRET_PATTERNS)).toBe(true);
      expect(isSecretKey("SQL_URL", undefined, SECRET_PATTERNS)).toBe(true);
      expect(isSecretKey("POSTGRES_URL", undefined, SECRET_PATTERNS)).toBe(true);
      expect(isSecretKey("MYSQL_CONNECTION_STRING", undefined, SECRET_PATTERNS)).toBe(true);
      expect(isSecretKey("DATABASEURL", undefined, SECRET_PATTERNS)).toBe(true);
    });

    it("matches variations with underscores and hyphens", () => {
      expect(isSecretKey("DATABASE-URL", undefined, SECRET_PATTERNS)).toBe(true);
      expect(isSecretKey("DB_CONNECTION-STRING", undefined, SECRET_PATTERNS)).toBe(true);
      expect(isSecretKey("REDIS-CONNECTION_STRING", undefined, SECRET_PATTERNS)).toBe(true);
    });
  });

  describe("access key pattern", () => {
    it("matches access key variations", () => {
      expect(isSecretKey("ACCESS_KEY", undefined, SECRET_PATTERNS)).toBe(true);
      expect(isSecretKey("ACCESSKEY", undefined, SECRET_PATTERNS)).toBe(true);
      expect(isSecretKey("ACCESS-KEY", undefined, SECRET_PATTERNS)).toBe(true);
      expect(isSecretKey("AWS_ACCESS_KEY", undefined, SECRET_PATTERNS)).toBe(true);
    });
  });

  describe("credential pattern", () => {
    it("matches credential variations", () => {
      expect(isSecretKey("CREDENTIAL", undefined, SECRET_PATTERNS)).toBe(true);
      expect(isSecretKey("CREDENTIALS", undefined, SECRET_PATTERNS)).toBe(true);
      expect(isSecretKey("SERVICE_CREDENTIAL", undefined, SECRET_PATTERNS)).toBe(true);
    });
  });

  describe("non-secret variables", () => {
    it("does not match common non-secret environment variables", () => {
      expect(isSecretKey("PORT", undefined, SECRET_PATTERNS)).toBe(false);
      expect(isSecretKey("HOST", undefined, SECRET_PATTERNS)).toBe(false);
      expect(isSecretKey("NODE_ENV", undefined, SECRET_PATTERNS)).toBe(false);
      expect(isSecretKey("PUBLIC_URL", undefined, SECRET_PATTERNS)).toBe(false);
      expect(isSecretKey("APP_NAME", undefined, SECRET_PATTERNS)).toBe(false);
      expect(isSecretKey("LOG_LEVEL", undefined, SECRET_PATTERNS)).toBe(false);
      expect(isSecretKey("TIMEOUT", undefined, SECRET_PATTERNS)).toBe(false);
      expect(isSecretKey("MAX_RETRIES", undefined, SECRET_PATTERNS)).toBe(false);
    });
  });

  describe("case insensitivity", () => {
    it("matches patterns regardless of case", () => {
      expect(isSecretKey("api_key", undefined, SECRET_PATTERNS)).toBe(true);
      expect(isSecretKey("Api_Key", undefined, SECRET_PATTERNS)).toBe(true);
      expect(isSecretKey("token", undefined, SECRET_PATTERNS)).toBe(true);
      expect(isSecretKey("Token", undefined, SECRET_PATTERNS)).toBe(true);
      expect(isSecretKey("password", undefined, SECRET_PATTERNS)).toBe(true);
      expect(isSecretKey("Password", undefined, SECRET_PATTERNS)).toBe(true);
    });
  });
});
