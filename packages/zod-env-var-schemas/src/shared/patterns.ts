export const JWT_TOKEN_DURATION_PATTERN = /^\d+[smhd]$/;
export const HTTP_PROTOCOL_PATTERN = /^https?:\/\//;
export const HTTPS_PROTOCOL_PATTERN = /^https:\/\//;

export const POSTGRES_URL_PATTERN =
  /^postgresql:\/\/(?:[^:@\/]+(?::[^@\/]*)?@)?[^:\/]+(?::\d+)?(?:\/[^?]*)?(?:\?.*)?$/;

export const MYSQL_URL_PATTERN =
  /^mysql:\/\/(?:[^:@\/]+(?::[^@\/]*)?@)?[^:\/]+(?::\d+)?(?:\/[^?]*)?(?:\?.*)?$/;

export const MONGODB_URL_PATTERN =
  /^mongodb(?:\+srv)?:\/\/(?:[^:@\/]+(?::[^@\/]*)?@)?[^:\/,]+(?::\d+)?(?:,[^:\/,]+(?::\d+)?)*(?:\/[^?]*)?(?:\?.*)?$/;

export const SQLSERVER_URL_PREFIX_PATTERN = /^sqlserver:\/\//;
export const SQLSERVER_SERVER_PATTERN = /Server=.+/;
export const SQLSERVER_DATABASE_PATTERN = /Database=.+/;
export const SQLSERVER_INITIAL_CATALOG_PATTERN = /Initial Catalog=.+/;

export const REDIS_URL_PATTERN =
  /^rediss?:\/\/(?:[^:@\/]+(?::[^@\/]*)?@)?[^:\/]+(?::\d+)?(?:\/\d+)?(?:\?.*)?$/;

export const GENERIC_DATABASE_URL_PATTERN =
  /^(postgresql|mysql|mongodb|mongodb\+srv|sqlserver|sqlite|oracle|redshift):\/\/.+/;

export const DATABASE_NAME_PATTERN = /^[a-zA-Z0-9_-]+$/;
export const DATABASE_SCHEMA_PATTERN = /^[a-zA-Z0-9_]+$/;

export const AZURE_STORAGE_CONNECTION_STRING_PATTERN =
  /^DefaultEndpointsProtocol=https;AccountName=[^;]+;AccountKey=[^;]+;EndpointSuffix=[^;]+$/;

export const AZURE_STORAGE_ACCOUNT_NAME_PATTERN = /^[a-z0-9]{3,24}$/;

export const AZURE_SERVICE_BUS_CONNECTION_STRING_PATTERN =
  /^Endpoint=sb:\/\/[^;]+;SharedAccessKeyName=[^;]+;SharedAccessKey=[^;]+$/;

export const AZURE_EVENT_HUB_CONNECTION_STRING_PATTERN =
  /^Endpoint=sb:\/\/[^;]+;SharedAccessKeyName=[^;]+;SharedAccessKey=[^;]+;EntityPath=[^;]+$/;

export const AWS_SQS_QUEUE_URL_PATTERN =
  /^https:\/\/sqs\.[^.]+\.amazonaws\.com\/\d+\/[^\/]+$/;

export const AWS_REGION_PATTERN = /^[a-z]{2}-[a-z]+-\d{1}$/;

export const AWS_S3_BUCKET_NAME_PATTERN = /^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/;

export const HOST_PORT_LIST_PATTERN = /^[^:,]+:\d+(?:,[^:,]+:\d+)*$/;

export const RABBITMQ_URL_PATTERN =
  /^amqps?:\/\/(?:[^:@\/]+(?::[^@\/]*)?@)?[^:\/]+(?::\d+)?(?:\/.*)?$/;

export const KUBERNETES_NAME_PATTERN = /^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/;

export const SENTRY_DSN_PATTERN =
  /^https:\/\/[a-f0-9]+@[a-f0-9]+\.ingest\.sentry\.io\/\d+$/;
