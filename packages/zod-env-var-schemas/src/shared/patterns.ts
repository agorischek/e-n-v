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

export const HOST_PORT_LIST_PATTERN = /^[a-zA-Z0-9.-]+:\d+(,[a-zA-Z0-9.-]+:\d+)*$/;

export const AZURE_STORAGE_CONNECTION_STRING_PATTERN = /^DefaultEndpointsProtocol=https;AccountName=[^;]+;AccountKey=[^;]+;EndpointSuffix=.+$/;
export const AZURE_STORAGE_ACCOUNT_NAME_PATTERN = /^[a-z0-9]{3,24}$/;
export const AZURE_SERVICE_BUS_CONNECTION_STRING_PATTERN = /^Endpoint=sb:\/\/[^;]+;SharedAccessKeyName=[^;]+;SharedAccessKey=.+$/;
export const AZURE_EVENT_HUB_CONNECTION_STRING_PATTERN = /^Endpoint=sb:\/\/[^;]+;SharedAccessKeyName=[^;]+;SharedAccessKey=.+$/;




