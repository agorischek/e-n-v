export * from "./api";
export * from "./applicationInsights";
export * from "./aws";
export * from "./azure";
export * from "./memcached";
export * from "./cors";
export * from "./database";
export * from "./datadog";
export * from "./docker";
export * from "./elasticsearch";
export * from "./encryptionKey";
export * from "./host";
export * from "./jwt";
export * from "./kafka";
export * from "./kubernetes";
export * from "./logLevel";
export * from "./rabbitmq";
export * from "./monitoring";
export * from "./node";
export * from "./oauth";
export * from "./openai";
export * from "./redis";
export * from "./port";
export * from "./rateLimit";
export * from "./webhook";

import type { ZodSingleton } from "./types";
import { apiKey, apiBaseUrl, apiTimeout } from "./api";
import { 
  applicationInsightsConnectionString,
  appInsightsInstrumentationKey,
  appInsightsRoleName,
  appInsightsSamplingRate,
  appInsightsAutocollectDependencies,
  appInsightsAutocollectExceptions,
  appInsightsAutocollectConsole,
  appInsightsAutocollectPerformance
} from "./applicationInsights";
import { 
  awsAccessKeyId,
  awsSecretAccessKey,
  awsRegion,
  awsS3BucketName,
  awsSqsQueueUrl
} from "./aws";
import {
  azureStorageConnectionString,
  azureStorageAccountName,
  azureStorageAccountKey,
  azureServiceBusConnectionString,
  azureEventHubConnectionString
} from "./azure";
import { memcachedServers } from "./memcached";
import { cors } from "./cors";
import {
  databaseUrl,
  databaseHost,
  databasePort,
  databaseName,
  databaseUsername,
  databasePassword,
  databaseSchema,
  databasePoolSize,
  databaseTimeout,
  databaseSsl
} from "./database";
import { datadogApiKey } from "./datadog";
import {
  dockerRegistryUrl,
  dockerRegistryUsername,
  dockerRegistryPassword
} from "./docker";
import {
  elasticsearchUrl,
  elasticsearchUsername,
  elasticsearchPassword
} from "./elasticsearch";
import { encryptionKey } from "./encryptionKey";
import { hostSchema } from "./host";
import {
  jwtSecret,
  jwtAccessTokenExpiresIn,
  jwtRefreshTokenExpiresIn
} from "./jwt";
import { kafkaBrokers, kafkaClientId } from "./kafka";
import { kubernetesNamespace, kubernetesServiceAccount } from "./kubernetes";
import { logLevelSchema } from "./logLevel";
import { rabbitmqUrl } from "./rabbitmq";
import {
  newRelicLicenseKey,
  sentryDsn,
  jaegerEndpoint,
  prometheusPort
} from "./monitoring";
import { nodeEnv } from "./node";
import {
  oauthClientId,
  oauthClientSecret,
  oauthRedirectUri,
  oauthScope
} from "./oauth";
import {
  openaiApiKey,
  openaiOrganizationId,
  openaiProjectId,
  openaiBaseUrl,
  openaiModel,
  openaiTimeout
} from "./openai";
import {
  redisUrl,
  redisHost,
  redisPort,
  redisUsername,
  redisPassword,
  redisDb,
  redisTls,
  redisTlsCaCertPath
} from "./redis";
import { port } from "./port";
import { rateLimitRpm, rateLimitWindow } from "./rateLimit";
import { webhookUrl } from "./webhook";

export default (z: ZodSingleton) => ({
  // API
  API_KEY: apiKey(z),
  API_BASE_URL: apiBaseUrl(z),
  API_TIMEOUT: apiTimeout(z),

  // Application Insights
  APPLICATIONINSIGHTS_CONNECTION_STRING: applicationInsightsConnectionString(z),
  APPINSIGHTS_INSTRUMENTATIONKEY: appInsightsInstrumentationKey(z),
  APPINSIGHTS_ROLE_NAME: appInsightsRoleName(z),
  APPINSIGHTS_SAMPLING_RATE: appInsightsSamplingRate(z),
  APPINSIGHTS_AUTOCOLLECT_DEPENDENCIES: appInsightsAutocollectDependencies(z),
  APPINSIGHTS_AUTOCOLLECT_EXCEPTIONS: appInsightsAutocollectExceptions(z),
  APPINSIGHTS_AUTOCOLLECT_CONSOLE: appInsightsAutocollectConsole(z),
  APPINSIGHTS_AUTOCOLLECT_PERFORMANCE: appInsightsAutocollectPerformance(z),

  // AWS
  AWS_ACCESS_KEY_ID: awsAccessKeyId(z),
  AWS_SECRET_ACCESS_KEY: awsSecretAccessKey(z),
  AWS_REGION: awsRegion(z),
  AWS_S3_BUCKET_NAME: awsS3BucketName(z),
  AWS_SQS_QUEUE_URL: awsSqsQueueUrl(z),

  // Azure
  AZURE_STORAGE_CONNECTION_STRING: azureStorageConnectionString(z),
  AZURE_STORAGE_ACCOUNT_NAME: azureStorageAccountName(z),
  AZURE_STORAGE_ACCOUNT_KEY: azureStorageAccountKey(z),
  AZURE_SERVICE_BUS_CONNECTION_STRING: azureServiceBusConnectionString(z),
  AZURE_EVENT_HUB_CONNECTION_STRING: azureEventHubConnectionString(z),

  // Cache
  MEMCACHED_SERVERS: memcachedServers(z),

  // CORS
  CORS_ORIGIN: cors(z),

  // Database
  DATABASE_URL: databaseUrl(z),
  DATABASE_HOST: databaseHost(z),
  DATABASE_PORT: databasePort(z),
  DATABASE_NAME: databaseName(z),
  DATABASE_USERNAME: databaseUsername(z),
  DATABASE_PASSWORD: databasePassword(z),
  DATABASE_SCHEMA: databaseSchema(z),
  DATABASE_POOL_SIZE: databasePoolSize(z),
  DATABASE_TIMEOUT: databaseTimeout(z),
  DATABASE_SSL: databaseSsl(z),

  // Monitoring
  DATADOG_API_KEY: datadogApiKey(z),

  // Docker
  DOCKER_REGISTRY_URL: dockerRegistryUrl(z),
  DOCKER_REGISTRY_USERNAME: dockerRegistryUsername(z),
  DOCKER_REGISTRY_PASSWORD: dockerRegistryPassword(z),

  // Elasticsearch
  ELASTICSEARCH_URL: elasticsearchUrl(z),
  ELASTICSEARCH_USERNAME: elasticsearchUsername(z),
  ELASTICSEARCH_PASSWORD: elasticsearchPassword(z),

  // Security
  ENCRYPTION_KEY: encryptionKey(z),

  // Infrastructure
  HOST: hostSchema(z),
  PORT: port(z),

  // JWT
  JWT_SECRET: jwtSecret(z),
  JWT_ACCESS_TOKEN_EXPIRES_IN: jwtAccessTokenExpiresIn(z),
  JWT_REFRESH_TOKEN_EXPIRES_IN: jwtRefreshTokenExpiresIn(z),

  // Kafka
  KAFKA_BROKERS: kafkaBrokers(z),
  KAFKA_CLIENT_ID: kafkaClientId(z),

  // Kubernetes
  KUBERNETES_NAMESPACE: kubernetesNamespace(z),
  KUBERNETES_SERVICE_ACCOUNT: kubernetesServiceAccount(z),

  // Logging
  LOG_LEVEL: logLevelSchema(z),

  // Message Queue
  RABBITMQ_URL: rabbitmqUrl(z),

  // Monitoring
  NEW_RELIC_LICENSE_KEY: newRelicLicenseKey(z),
  SENTRY_DSN: sentryDsn(z),
  JAEGER_ENDPOINT: jaegerEndpoint(z),
  PROMETHEUS_PORT: prometheusPort(z),

  // Node
  NODE_ENV: nodeEnv(z),

  // OAuth
  OAUTH_CLIENT_ID: oauthClientId(z),
  OAUTH_CLIENT_SECRET: oauthClientSecret(z),
  OAUTH_REDIRECT_URI: oauthRedirectUri(z),
  OAUTH_SCOPE: oauthScope(z),

  // OpenAI
  OPENAI_API_KEY: openaiApiKey(z),
  OPENAI_ORGANIZATION_ID: openaiOrganizationId(z),
  OPENAI_PROJECT_ID: openaiProjectId(z),
  OPENAI_BASE_URL: openaiBaseUrl(z),
  OPENAI_MODEL: openaiModel(z),
  OPENAI_TIMEOUT: openaiTimeout(z),

  // Redis
  REDIS_URL: redisUrl(z),
  REDIS_HOST: redisHost(z),
  REDIS_PORT: redisPort(z),
  REDIS_USERNAME: redisUsername(z),
  REDIS_PASSWORD: redisPassword(z),
  REDIS_DB: redisDb(z),
  REDIS_TLS: redisTls(z),
  REDIS_TLS_CA_CERT_PATH: redisTlsCaCertPath(z),

  // Rate Limiting
  RATE_LIMIT_RPM: rateLimitRpm(z),
  RATE_LIMIT_WINDOW: rateLimitWindow(z),

  // Webhooks
  WEBHOOK_URL: webhookUrl(z),
});
