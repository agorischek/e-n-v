import { COMMON_MESSAGES } from "./messages";

export const descriptions = {
  azureStorageConnectionString: "Azure Storage Account connection string",
  azureStorageAccountName: "Azure Storage Account name",
  azureStorageAccountKey: "Azure Storage Account key",
  azureServiceBusConnectionString: "Azure Service Bus connection string",
  azureEventHubConnectionString: "Azure Event Hub connection string",
  awsSqsQueueUrl: "AWS SQS queue URL",
  awsRegion: "AWS region",
  awsAccessKeyId: "AWS access key ID",
  awsSecretAccessKey: "AWS secret access key",
  awsS3BucketName: "AWS S3 bucket name",
  elasticsearchUrl: "Elasticsearch/OpenSearch URL",
  elasticsearchUsername: "Elasticsearch username",
  elasticsearchPassword: "Elasticsearch password",
  rabbitmqUrl: "RabbitMQ connection URL",
  kafkaBrokers: "Kafka broker list (comma-separated host:port)",
  kafkaClientId: "Kafka client ID",
  memcachedServers: "Memcached servers (comma-separated host:port)",
  dockerRegistryUrl: "Docker registry URL",
  dockerRegistryUsername: "Docker registry username",
  dockerRegistryPassword: "Docker registry password or access token",
  kubernetesNamespace: "Kubernetes namespace",
  kubernetesServiceAccount: "Kubernetes service account",
  prometheusPort: "Prometheus metrics port",
  jaegerEndpoint: "Jaeger tracing endpoint URL",
  newRelicLicenseKey: "New Relic license key",
  datadogApiKey: "Datadog API key",
  sentryDsn: "Sentry DSN for error tracking",
} as const;

export const traits = {
  azureStorageConnectionStringFormat:
    "a valid Azure Storage connection string",
  azureStorageAccountNameFormat:
    "3-24 characters, lowercase letters and numbers only",
  azureStorageAccountKeyRequired: "storage account key is required",
  azureServiceBusConnectionStringFormat:
    "a valid Azure Service Bus connection string",
  azureEventHubConnectionStringFormat:
    "a valid Azure Event Hub connection string",
  awsSqsQueueUrlFormat: "a valid AWS SQS queue URL",
  awsRegionFormat: "a valid AWS region format (e.g., us-east-1)",
  awsAccessKeyIdMin: "at least 16 characters",
  awsAccessKeyIdMax: "less than 128 characters",
  awsSecretAccessKeyRequired: "AWS secret access key is required",
  awsS3BucketNameFormat:
    "3-63 characters, lowercase letters, numbers, and hyphens only",
  elasticsearchUrlFormat: COMMON_MESSAGES.MUST_BE_VALID_URL,
  elasticsearchUrlProtocol: "start with http:// or https://",
  rabbitmqUrlFormat: "a valid RabbitMQ URL (amqp:// or amqps://...)",
  hostPortListFormat:
    "comma-separated list of host:port (e.g., localhost:9092,broker2:9092)",
  kafkaClientIdRequired: "Kafka client ID is required",
  dockerRegistryUrlFormat: COMMON_MESSAGES.MUST_BE_VALID_URL,
  kubernetesNameFormat: "a valid Kubernetes namespace name",
  kubernetesServiceAccountFormat:
    "a valid Kubernetes service account name",
  prometheusPortInt: "an integer",
  prometheusPortMin: ">= 1024",
  prometheusPortMax: "<= 65535",
  jaegerEndpointFormat: COMMON_MESSAGES.MUST_BE_VALID_URL,
  newRelicLicenseKeyLength:
    "exactly 40 characters",
  datadogApiKeyLength: "exactly 32 characters",
  sentryDsnFormat: "a valid Sentry DSN format",
} as const;

export const defaults = {
  kubernetesNamespace: "default",
  prometheusPort: 9090,
} as const;

export const constraints = {
  awsAccessKeyIdMin: 16,
  awsAccessKeyIdMax: 128,
  prometheusPortMin: 1024,
  prometheusPortMax: 65535,
  newRelicLicenseKeyLength: 40,
  datadogApiKeyLength: 32,
} as const;

export const patterns = {
  awsRegion: /^[a-z]{2}-[a-z]+-\d{1}$/,
  awsS3BucketName: /^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/,
  awsSqsQueueUrl: /^https:\/\/sqs\.[^.]+\.amazonaws\.com\/\d+\/[^/]+$/,
  azureStorageConnectionString:
    /^DefaultEndpointsProtocol=https;AccountName=[^;]+;AccountKey=[^;]+;EndpointSuffix=.+$/,
  azureStorageAccountName: /^[a-z0-9]{3,24}$/,
  azureServiceBusConnectionString:
    /^Endpoint=sb:\/\/[^;]+;SharedAccessKeyName=[^;]+;SharedAccessKey=.+$/,
  azureEventHubConnectionString:
    /^Endpoint=sb:\/\/[^;]+;SharedAccessKeyName=[^;]+;SharedAccessKey=.+$/,
  hostPortList: /^[a-zA-Z0-9.-]+:\d+(,[a-zA-Z0-9.-]+:\d+)*$/,
  rabbitmqUrl: /^amqps?:\/\/(?:[^:@/]+(?::[^@/]*)?@)?[^:/]+(?::\d+)?(?:\/.*)?$/,
  kubernetesName: /^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/,
  sentryDsn: /^https:\/\/[a-f0-9]+@[a-f0-9]+\.ingest\.sentry\.io\/\d+$/,
} as const;
