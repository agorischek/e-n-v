import { AZURE_STORAGE_CONNECTION_STRING } from "./azureStorageConnectionString";
import { AZURE_STORAGE_ACCOUNT_NAME } from "./azureStorageAccountName";
import { AZURE_STORAGE_ACCOUNT_KEY } from "./azureStorageAccountKey";
import { AZURE_SERVICE_BUS_CONNECTION_STRING } from "./azureServiceBusConnectionString";
import { AZURE_EVENT_HUB_CONNECTION_STRING } from "./azureEventHubConnectionString";
import { AWS_SQS_QUEUE_URL } from "./awsSqsQueueUrl";
import { AWS_REGION } from "./awsRegion";
import { AWS_ACCESS_KEY_ID } from "./awsAccessKeyId";
import { AWS_SECRET_ACCESS_KEY } from "./awsSecretAccessKey";
import { AWS_S3_BUCKET_NAME } from "./awsS3BucketName";

import { RABBITMQ_URL } from "./rabbitmqUrl";

import { MEMCACHED_SERVERS } from "./memcachedServers";

import { KUBERNETES_NAMESPACE } from "./kubernetesNamespace";
import { KUBERNETES_SERVICE_ACCOUNT } from "./kubernetesServiceAccount";
import { PROMETHEUS_PORT } from "./prometheusPort";
import { JAEGER_ENDPOINT } from "./jaegerEndpoint";
import { NEW_RELIC_LICENSE_KEY } from "./newRelicLicenseKey";
import { SENTRY_DSN } from "./sentryDsn";

export { azureStorageConnectionStringSchema, AZURE_STORAGE_CONNECTION_STRING } from "./azureStorageConnectionString";
export { azureStorageAccountNameSchema, AZURE_STORAGE_ACCOUNT_NAME } from "./azureStorageAccountName";
export { azureStorageAccountKeySchema, AZURE_STORAGE_ACCOUNT_KEY } from "./azureStorageAccountKey";
export { azureServiceBusConnectionStringSchema, AZURE_SERVICE_BUS_CONNECTION_STRING } from "./azureServiceBusConnectionString";
export { azureEventHubConnectionStringSchema, AZURE_EVENT_HUB_CONNECTION_STRING } from "./azureEventHubConnectionString";
export { awsSqsQueueUrlSchema, AWS_SQS_QUEUE_URL } from "./awsSqsQueueUrl";
export { awsRegionSchema, AWS_REGION } from "./awsRegion";
export { awsAccessKeyIdSchema, AWS_ACCESS_KEY_ID } from "./awsAccessKeyId";
export { awsSecretAccessKeySchema, AWS_SECRET_ACCESS_KEY } from "./awsSecretAccessKey";
export { awsS3BucketNameSchema, AWS_S3_BUCKET_NAME } from "./awsS3BucketName";

export { rabbitmqUrlSchema, RABBITMQ_URL } from "./rabbitmqUrl";

export { memcachedServersSchema, MEMCACHED_SERVERS } from "./memcachedServers";

export { kubernetesNamespaceSchema, KUBERNETES_NAMESPACE } from "./kubernetesNamespace";
export { kubernetesServiceAccountSchema, KUBERNETES_SERVICE_ACCOUNT } from "./kubernetesServiceAccount";
export { prometheusPortSchema, PROMETHEUS_PORT } from "./prometheusPort";
export { jaegerEndpointSchema, JAEGER_ENDPOINT } from "./jaegerEndpoint";
export { newRelicLicenseKeySchema, NEW_RELIC_LICENSE_KEY } from "./newRelicLicenseKey";
export { sentryDsnSchema, SENTRY_DSN } from "./sentryDsn";

export const infrastructureSchemas = {
  AZURE_STORAGE_CONNECTION_STRING,
  AZURE_STORAGE_ACCOUNT_NAME,
  AZURE_STORAGE_ACCOUNT_KEY,
  AZURE_SERVICE_BUS_CONNECTION_STRING,
  AZURE_EVENT_HUB_CONNECTION_STRING,
  AWS_REGION,
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  AWS_S3_BUCKET_NAME,
  AWS_SQS_QUEUE_URL,
  RABBITMQ_URL,
  KAFKA_BROKERS,
  KAFKA_CLIENT_ID,
  MEMCACHED_SERVERS,
  KUBERNETES_NAMESPACE,
  KUBERNETES_SERVICE_ACCOUNT,
  PROMETHEUS_PORT,
  JAEGER_ENDPOINT,
  NEW_RELIC_LICENSE_KEY,
  SENTRY_DSN,
} as const;
