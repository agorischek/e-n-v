import { COMMON_MESSAGES } from "./messages";

export const INFRASTRUCTURE_DESCRIPTIONS = {
  AZURE_STORAGE_CONNECTION_STRING: "Azure Storage Account connection string",
  AZURE_STORAGE_ACCOUNT_NAME: "Azure Storage Account name",
  AZURE_STORAGE_ACCOUNT_KEY: "Azure Storage Account key",
  AZURE_SERVICE_BUS_CONNECTION_STRING: "Azure Service Bus connection string",
  AZURE_EVENT_HUB_CONNECTION_STRING: "Azure Event Hub connection string",
  AWS_SQS_QUEUE_URL: "AWS SQS queue URL",
  AWS_REGION: "AWS region",
  AWS_ACCESS_KEY_ID: "AWS access key ID",
  AWS_SECRET_ACCESS_KEY: "AWS secret access key",
  AWS_S3_BUCKET_NAME: "AWS S3 bucket name",
  ELASTICSEARCH_URL: "Elasticsearch/OpenSearch URL",
  ELASTICSEARCH_USERNAME: "Elasticsearch username",
  ELASTICSEARCH_PASSWORD: "Elasticsearch password",
  RABBITMQ_URL: "RabbitMQ connection URL",
  KAFKA_BROKERS: "Kafka broker list (comma-separated host:port)",
  KAFKA_CLIENT_ID: "Kafka client ID",
  MEMCACHED_SERVERS: "Memcached servers (comma-separated host:port)",
  DOCKER_REGISTRY_URL: "Docker registry URL",
  DOCKER_REGISTRY_USERNAME: "Docker registry username",
  DOCKER_REGISTRY_PASSWORD: "Docker registry password or access token",
  KUBERNETES_NAMESPACE: "Kubernetes namespace",
  KUBERNETES_SERVICE_ACCOUNT: "Kubernetes service account",
  PROMETHEUS_PORT: "Prometheus metrics port",
  JAEGER_ENDPOINT: "Jaeger tracing endpoint URL",
  NEW_RELIC_LICENSE_KEY: "New Relic license key",
  DATADOG_API_KEY: "Datadog API key",
  SENTRY_DSN: "Sentry DSN for error tracking",
} as const;

export const INFRASTRUCTURE_MESSAGES = {
  AZURE_STORAGE_CONNECTION_STRING_FORMAT: "Must be a valid Azure Storage connection string",
  AZURE_STORAGE_ACCOUNT_NAME_FORMAT:
    "Storage account name must be 3-24 characters, lowercase letters and numbers only",
  AZURE_STORAGE_ACCOUNT_KEY_REQUIRED: "Storage account key is required",
  AZURE_SERVICE_BUS_CONNECTION_STRING_FORMAT:
    "Must be a valid Azure Service Bus connection string",
  AZURE_EVENT_HUB_CONNECTION_STRING_FORMAT:
    "Must be a valid Azure Event Hub connection string",
  AWS_SQS_QUEUE_URL_FORMAT: "Must be a valid AWS SQS queue URL",
  AWS_REGION_FORMAT: "Must be a valid AWS region format (e.g., us-east-1)",
  AWS_ACCESS_KEY_ID_MIN: "AWS access key ID must be at least 16 characters",
  AWS_ACCESS_KEY_ID_MAX: "AWS access key ID must be less than 128 characters",
  AWS_SECRET_ACCESS_KEY_REQUIRED: "AWS secret access key is required",
  AWS_S3_BUCKET_NAME_FORMAT:
    "S3 bucket names must be 3-63 characters, lowercase letters, numbers, and hyphens only",
  ELASTICSEARCH_URL_FORMAT: COMMON_MESSAGES.MUST_BE_VALID_URL,
  ELASTICSEARCH_URL_PROTOCOL: "Must start with http:// or https://",
  RABBITMQ_URL_FORMAT: "Must be a valid RabbitMQ URL (amqp:// or amqps://...)",
  HOST_PORT_LIST_FORMAT: "Must be comma-separated list of host:port (e.g., localhost:9092,broker2:9092)",
  KAFKA_CLIENT_ID_REQUIRED: "Kafka client ID is required",
  DOCKER_REGISTRY_URL_FORMAT: COMMON_MESSAGES.MUST_BE_VALID_URL,
  KUBERNETES_NAME_FORMAT: "Must be a valid Kubernetes namespace name",
  KUBERNETES_SERVICE_ACCOUNT_FORMAT: "Must be a valid Kubernetes service account name",
  PROMETHEUS_PORT_INT: "Port must be an integer",
  PROMETHEUS_PORT_MIN: "Port must be >= 1024",
  PROMETHEUS_PORT_MAX: "Port must be <= 65535",
  JAEGER_ENDPOINT_FORMAT: COMMON_MESSAGES.MUST_BE_VALID_URL,
  NEW_RELIC_LICENSE_KEY_LENGTH: "New Relic license key must be exactly 40 characters",
  DATADOG_API_KEY_LENGTH: "Datadog API key must be exactly 32 characters",
  SENTRY_DSN_FORMAT: "Must be a valid Sentry DSN format",
} as const;

export const INFRASTRUCTURE_DEFAULTS = {
  KUBERNETES_NAMESPACE: "default",
  PROMETHEUS_PORT: 9090,
} as const;

export const INFRASTRUCTURE_LIMITS = {
  AWS_ACCESS_KEY_ID_MIN: 16,
  AWS_ACCESS_KEY_ID_MAX: 128,
  PROMETHEUS_PORT_MIN: 1024,
  PROMETHEUS_PORT_MAX: 65535,
  NEW_RELIC_LICENSE_KEY_LENGTH: 40,
  DATADOG_API_KEY_LENGTH: 32,
} as const;
