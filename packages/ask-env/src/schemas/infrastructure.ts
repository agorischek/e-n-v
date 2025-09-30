import { z } from "zod";

/**
 * Azure Storage Account connection string
 * Format: DefaultEndpointsProtocol=https;AccountName=myaccount;AccountKey=key;EndpointSuffix=core.windows.net
 */
export const AZURE_STORAGE_CONNECTION_STRING = z
  .string()
  .describe("Azure Storage Account connection string")
  .regex(
    /^DefaultEndpointsProtocol=https;AccountName=[^;]+;AccountKey=[^;]+;EndpointSuffix=[^;]+$/,
    "Must be a valid Azure Storage connection string"
  );

/**
 * Azure Storage Account name
 */
export const AZURE_STORAGE_ACCOUNT_NAME = z
  .string()
  .describe("Azure Storage Account name")
  .regex(/^[a-z0-9]{3,24}$/, "Storage account name must be 3-24 characters, lowercase letters and numbers only");

/**
 * Azure Storage Account key
 */
export const AZURE_STORAGE_ACCOUNT_KEY = z
  .string()
  .describe("Azure Storage Account key")
  .min(1, "Storage account key is required");

/**
 * Azure Service Bus connection string
 */
export const AZURE_SERVICE_BUS_CONNECTION_STRING = z
  .string()
  .describe("Azure Service Bus connection string")
  .regex(
    /^Endpoint=sb:\/\/[^;]+;SharedAccessKeyName=[^;]+;SharedAccessKey=[^;]+$/,
    "Must be a valid Azure Service Bus connection string"
  );

/**
 * Azure Event Hub connection string
 */
export const AZURE_EVENT_HUB_CONNECTION_STRING = z
  .string()
  .describe("Azure Event Hub connection string")
  .regex(
    /^Endpoint=sb:\/\/[^;]+;SharedAccessKeyName=[^;]+;SharedAccessKey=[^;]+;EntityPath=[^;]+$/,
    "Must be a valid Azure Event Hub connection string"
  );

/**
 * Amazon SQS queue URL
 */
export const AWS_SQS_QUEUE_URL = z
  .string()
  .describe("AWS SQS queue URL")
  .regex(
    /^https:\/\/sqs\.[^.]+\.amazonaws\.com\/\d+\/[^\/]+$/,
    "Must be a valid AWS SQS queue URL"
  );

/**
 * AWS region
 */
export const AWS_REGION = z
  .string()
  .describe("AWS region")
  .regex(/^[a-z]{2}-[a-z]+-\d{1}$/, "Must be a valid AWS region format (e.g., us-east-1)");

/**
 * AWS access key ID
 */
export const AWS_ACCESS_KEY_ID = z
  .string()
  .describe("AWS access key ID")
  .min(16, "AWS access key ID must be at least 16 characters")
  .max(128, "AWS access key ID must be less than 128 characters");

/**
 * AWS secret access key
 */
export const AWS_SECRET_ACCESS_KEY = z
  .string()
  .describe("AWS secret access key")
  .min(1, "AWS secret access key is required");

/**
 * AWS S3 bucket name
 */
export const AWS_S3_BUCKET_NAME = z
  .string()
  .describe("AWS S3 bucket name")
  .regex(/^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/, "S3 bucket names must be 3-63 characters, lowercase letters, numbers, and hyphens only");

/**
 * Elasticsearch/OpenSearch URL
 */
export const ELASTICSEARCH_URL = z
  .string()
  .describe("Elasticsearch/OpenSearch URL")
  .url("Must be a valid URL")
  .regex(/^https?:\/\//, "Must start with http:// or https://");

/**
 * Elasticsearch username
 */
export const ELASTICSEARCH_USERNAME = z
  .string()
  .describe("Elasticsearch username")
  .optional();

/**
 * Elasticsearch password
 */
export const ELASTICSEARCH_PASSWORD = z
  .string()
  .describe("Elasticsearch password")
  .optional();

/**
 * RabbitMQ connection URL
 */
export const RABBITMQ_URL = z
  .string()
  .describe("RabbitMQ connection URL")
  .regex(
    /^amqps?:\/\/(?:[^:@\/]+(?::[^@\/]*)?@)?[^:\/]+(?::\d+)?(?:\/.*)?$/,
    "Must be a valid RabbitMQ URL (amqp:// or amqps://...)"
  );

/**
 * Apache Kafka broker list
 */
export const KAFKA_BROKERS = z
  .string()
  .describe("Kafka broker list (comma-separated host:port)")
  .regex(
    /^[^:,]+:\d+(?:,[^:,]+:\d+)*$/,
    "Must be comma-separated list of host:port (e.g., localhost:9092,broker2:9092)"
  );

/**
 * Kafka client ID
 */
export const KAFKA_CLIENT_ID = z
  .string()
  .describe("Kafka client ID")
  .min(1, "Kafka client ID is required");

/**
 * Memcached servers list
 */
export const MEMCACHED_SERVERS = z
  .string()
  .describe("Memcached servers (comma-separated host:port)")
  .regex(
    /^[^:,]+:\d+(?:,[^:,]+:\d+)*$/,
    "Must be comma-separated list of host:port"
  );

/**
 * Docker registry URL
 */
export const DOCKER_REGISTRY_URL = z
  .string()
  .describe("Docker registry URL")
  .url("Must be a valid URL");

/**
 * Docker registry username
 */
export const DOCKER_REGISTRY_USERNAME = z
  .string()
  .describe("Docker registry username")
  .optional();

/**
 * Docker registry password/token
 */
export const DOCKER_REGISTRY_PASSWORD = z
  .string()
  .describe("Docker registry password or access token")
  .optional();

/**
 * Kubernetes namespace
 */
export const KUBERNETES_NAMESPACE = z
  .string()
  .describe("Kubernetes namespace")
  .regex(/^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/, "Must be a valid Kubernetes namespace name")
  .default("default");

/**
 * Kubernetes service account
 */
export const KUBERNETES_SERVICE_ACCOUNT = z
  .string()
  .describe("Kubernetes service account")
  .regex(/^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/, "Must be a valid Kubernetes service account name")
  .optional();

/**
 * Prometheus metrics port
 */
export const PROMETHEUS_PORT = z
  .number()
  .describe("Prometheus metrics port")
  .int("Port must be an integer")
  .min(1024, "Port must be >= 1024")
  .max(65535, "Port must be <= 65535")
  .default(9090);

/**
 * Jaeger tracing endpoint
 */
export const JAEGER_ENDPOINT = z
  .string()
  .describe("Jaeger tracing endpoint URL")
  .url("Must be a valid URL")
  .optional();

/**
 * New Relic license key
 */
export const NEW_RELIC_LICENSE_KEY = z
  .string()
  .describe("New Relic license key")
  .length(40, "New Relic license key must be exactly 40 characters")
  .optional();

/**
 * Datadog API key
 */
export const DATADOG_API_KEY = z
  .string()
  .describe("Datadog API key")
  .length(32, "Datadog API key must be exactly 32 characters")
  .optional();

/**
 * Sentry DSN (Data Source Name)
 */
export const SENTRY_DSN = z
  .string()
  .describe("Sentry DSN for error tracking")
  .regex(
    /^https:\/\/[a-f0-9]+@[a-f0-9]+\.ingest\.sentry\.io\/\d+$/,
    "Must be a valid Sentry DSN format"
  )
  .optional();

/**
 * Pre-configured infrastructure schemas for common scenarios
 */
export const infrastructureSchemas = {
  // Azure
  AZURE_STORAGE_CONNECTION_STRING,
  AZURE_STORAGE_ACCOUNT_NAME,
  AZURE_STORAGE_ACCOUNT_KEY,
  AZURE_SERVICE_BUS_CONNECTION_STRING,
  AZURE_EVENT_HUB_CONNECTION_STRING,
  
  // AWS
  AWS_REGION,
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  AWS_S3_BUCKET_NAME,
  AWS_SQS_QUEUE_URL,
  
  // Search & Analytics
  ELASTICSEARCH_URL,
  ELASTICSEARCH_USERNAME,
  ELASTICSEARCH_PASSWORD,
  
  // Message Queues
  RABBITMQ_URL,
  KAFKA_BROKERS,
  KAFKA_CLIENT_ID,
  
  // Caching
  MEMCACHED_SERVERS,
  
  // Container & Orchestration
  DOCKER_REGISTRY_URL,
  DOCKER_REGISTRY_USERNAME,
  DOCKER_REGISTRY_PASSWORD,
  KUBERNETES_NAMESPACE,
  KUBERNETES_SERVICE_ACCOUNT,
  
  // Monitoring & Observability
  PROMETHEUS_PORT,
  JAEGER_ENDPOINT,
  NEW_RELIC_LICENSE_KEY,
  DATADOG_API_KEY,
  SENTRY_DSN,
};