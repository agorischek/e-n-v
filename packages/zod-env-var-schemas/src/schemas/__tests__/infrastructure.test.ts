import { describe, expect, test } from "bun:test";
import { ZodError } from "zod";
import {
  AWS_ACCESS_KEY_ID,
  AWS_REGION,
  AWS_S3_BUCKET_NAME,
  AWS_SECRET_ACCESS_KEY,
  AWS_SQS_QUEUE_URL,
  AZURE_EVENT_HUB_CONNECTION_STRING,
  AZURE_SERVICE_BUS_CONNECTION_STRING,
  AZURE_STORAGE_ACCOUNT_KEY,
  AZURE_STORAGE_ACCOUNT_NAME,
  AZURE_STORAGE_CONNECTION_STRING,
  DATADOG_API_KEY,
  DOCKER_REGISTRY_PASSWORD,
  DOCKER_REGISTRY_URL,
  DOCKER_REGISTRY_USERNAME,
  ELASTICSEARCH_PASSWORD,
  ELASTICSEARCH_URL,
  ELASTICSEARCH_USERNAME,
  JAEGER_ENDPOINT,
  KAFKA_BROKERS,
  KAFKA_CLIENT_ID,
  KUBERNETES_NAMESPACE,
  KUBERNETES_SERVICE_ACCOUNT,
  MEMCACHED_SERVERS,
  NEW_RELIC_LICENSE_KEY,
  PROMETHEUS_PORT,
  RABBITMQ_URL,
  SENTRY_DSN,
} from "../infrastructure";

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

describe("infrastructure schemas", () => {
  test("azure connection details validate", () => {
    const storageConn = "DefaultEndpointsProtocol=https;AccountName=myacct;AccountKey=abc123;EndpointSuffix=core.windows.net";
    expect(AZURE_STORAGE_CONNECTION_STRING.parse(storageConn)).toBe(storageConn);
    expectZodMessage(
      () => AZURE_STORAGE_CONNECTION_STRING.parse("invalid"),
      "Must be a valid Azure Storage connection string",
    );

    expect(AZURE_STORAGE_ACCOUNT_NAME.parse("myaccount")).toBe("myaccount");
    expectZodMessage(
      () => AZURE_STORAGE_ACCOUNT_NAME.parse("INVALID"),
      "Storage account name must be 3-24 characters, lowercase letters and numbers only",
    );

  expect(AZURE_STORAGE_ACCOUNT_KEY.parse("abc123")).toBe("abc123");
    expectZodMessage(() => AZURE_STORAGE_ACCOUNT_KEY.parse(""), "Storage account key is required");

    const serviceBus = "Endpoint=sb://namespace.servicebus.windows.net/;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=abc=";
    expect(AZURE_SERVICE_BUS_CONNECTION_STRING.parse(serviceBus)).toBe(serviceBus);
    expectZodMessage(
      () => AZURE_SERVICE_BUS_CONNECTION_STRING.parse("Endpoint=missing"),
      "Must be a valid Azure Service Bus connection string",
    );

    const eventHub = "Endpoint=sb://namespace.servicebus.windows.net/;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=abc=;EntityPath=myhub";
    expect(AZURE_EVENT_HUB_CONNECTION_STRING.parse(eventHub)).toBe(eventHub);
    expectZodMessage(
      () => AZURE_EVENT_HUB_CONNECTION_STRING.parse("Endpoint=sb://missing"),
      "Must be a valid Azure Event Hub connection string",
    );
  });

  test("aws resources enforce formats", () => {
    const queueUrl = "https://sqs.us-east-1.amazonaws.com/123456789012/my-queue";
    expect(AWS_SQS_QUEUE_URL.parse(queueUrl)).toBe(queueUrl);
    expectZodMessage(
      () => AWS_SQS_QUEUE_URL.parse("http://sqs.invalid"),
      "Must be a valid AWS SQS queue URL",
    );

    expect(AWS_REGION.parse("us-east-1")).toBe("us-east-1");
    expectZodMessage(() => AWS_REGION.parse("useast1"), "Must be a valid AWS region format (e.g., us-east-1)");

    expect(AWS_ACCESS_KEY_ID.parse("A".repeat(20))).toBe("A".repeat(20));
    expectZodMessage(
      () => AWS_ACCESS_KEY_ID.parse("short"),
      "AWS access key ID must be at least 16 characters",
    );

    expect(AWS_SECRET_ACCESS_KEY.parse("secret")).toBe("secret");
    expectZodMessage(() => AWS_SECRET_ACCESS_KEY.parse(""), "AWS secret access key is required");

    expect(AWS_S3_BUCKET_NAME.parse("my-bucket")).toBe("my-bucket");
    expectZodMessage(
      () => AWS_S3_BUCKET_NAME.parse("Invalid_Bucket"),
      "S3 bucket names must be 3-63 characters, lowercase letters, numbers, and hyphens only",
    );
  });

  test("observability targets require valid URLs", () => {
    const elasticUrl = "https://search.example";
    expect(ELASTICSEARCH_URL.parse(elasticUrl)).toBe(elasticUrl);
    expectZodMessage(
      () => ELASTICSEARCH_URL.parse("ftp://search"),
      "Must start with http:// or https://",
    );
    expect(ELASTICSEARCH_USERNAME.parse(undefined)).toBeUndefined();
    expect(ELASTICSEARCH_PASSWORD.parse(undefined)).toBeUndefined();

    const rabbitUrl = "amqp://guest:guest@localhost:5672/";
    expect(RABBITMQ_URL.parse(rabbitUrl)).toBe(rabbitUrl);
    expectZodMessage(
      () => RABBITMQ_URL.parse("http://localhost"),
      "Must be a valid RabbitMQ URL (amqp:// or amqps://...)",
    );

    const kafkaList = "broker1:9092,broker2:9092";
    expect(KAFKA_BROKERS.parse(kafkaList)).toBe(kafkaList);
    expectZodMessage(
      () => KAFKA_BROKERS.parse("broker1"),
      "Must be comma-separated list of host:port (e.g., localhost:9092,broker2:9092)",
    );

    expect(KAFKA_CLIENT_ID.parse("analytics-service")).toBe("analytics-service");
    expectZodMessage(() => KAFKA_CLIENT_ID.parse(""), "Kafka client ID is required");

    const memcached = "cache1:11211,cache2:11211";
    expect(MEMCACHED_SERVERS.parse(memcached)).toBe(memcached);
    expectZodMessage(
      () => MEMCACHED_SERVERS.parse("cache1"),
      "Must be comma-separated list of host:port",
    );
  });

  test("container tooling fields support defaults", () => {
    const registry = "https://registry.example";
    expect(DOCKER_REGISTRY_URL.parse(registry)).toBe(registry);
    expectZodMessage(() => DOCKER_REGISTRY_URL.parse("not-a-url"), "Must be a valid URL");
    expect(DOCKER_REGISTRY_USERNAME.parse(undefined)).toBeUndefined();
    expect(DOCKER_REGISTRY_PASSWORD.parse(undefined)).toBeUndefined();

    expect(KUBERNETES_NAMESPACE.parse("default")).toBe("default");
    expect(KUBERNETES_NAMESPACE.parse(undefined)).toBe("default");
    expectZodMessage(
      () => KUBERNETES_NAMESPACE.parse("Invalid"),
      "Must be a valid Kubernetes namespace name",
    );

    expect(KUBERNETES_SERVICE_ACCOUNT.parse("service-account")).toBe("service-account");
    expect(KUBERNETES_SERVICE_ACCOUNT.parse(undefined)).toBeUndefined();
    expectZodMessage(
      () => KUBERNETES_SERVICE_ACCOUNT.parse("Invalid"),
      "Must be a valid Kubernetes service account name",
    );

    expect(PROMETHEUS_PORT.parse(9090)).toBe(9090);
    expect(PROMETHEUS_PORT.parse(undefined)).toBe(9090);
    expectZodMessage(() => PROMETHEUS_PORT.parse(1000), "Port must be >= 1024");
  });

  test("monitoring integrations enforce identifiers", () => {
    const jaeger = "https://jaeger.example/api/traces";
    expect(JAEGER_ENDPOINT.parse(jaeger)).toBe(jaeger);
    expect(JAEGER_ENDPOINT.parse(undefined)).toBeUndefined();
    expectZodMessage(() => JAEGER_ENDPOINT.parse("not-a-url"), "Must be a valid URL");

    expect(NEW_RELIC_LICENSE_KEY.parse("A".repeat(40))).toBe("A".repeat(40));
    expect(NEW_RELIC_LICENSE_KEY.parse(undefined)).toBeUndefined();
    expectZodMessage(
      () => NEW_RELIC_LICENSE_KEY.parse("short"),
      "New Relic license key must be exactly 40 characters",
    );

    expect(DATADOG_API_KEY.parse("a".repeat(32))).toBe("a".repeat(32));
    expect(DATADOG_API_KEY.parse(undefined)).toBeUndefined();
    expectZodMessage(
      () => DATADOG_API_KEY.parse("notlongenough"),
      "Datadog API key must be exactly 32 characters",
    );

  const sentry = "https://abcdef1234567890abcdef1234567890@abcdefabcdef.ingest.sentry.io/1234567";
    expect(SENTRY_DSN.parse(sentry)).toBe(sentry);
    expect(SENTRY_DSN.parse(undefined)).toBeUndefined();
    expectZodMessage(
      () => SENTRY_DSN.parse("https://bad"),
      "Must be a valid Sentry DSN format",
    );
  });
});
