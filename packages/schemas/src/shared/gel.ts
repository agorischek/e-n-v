export const descriptions = {
  gelDsn: "Gel database connection string (DSN)",
  gelInstance: "Gel Cloud instance name (format: org-name/instance-name)",
  gelSecretKey: "Gel Cloud secret key for authentication",
  gelHost: "Gel database host address",
  gelPort: "Gel database port number",
  gelUser: "Gel database username",
  gelPassword: "Gel database password",
  gelBranch: "Gel database branch name",
  gelTlsCaFile: "Path to TLS CA certificate file",
  gelClientTlsSecurity: "Gel client TLS security mode",
  gelCredentialsFile: "Path to Gel credentials JSON file",
} as const;

export const messages = {
  gelDsnFormat: "Must be a valid Gel DSN (gel://...)",
  gelInstanceFormat:
    "Must be in format org-name/instance-name",
  gelSecretKeyRequired: "Gel secret key is required",
  gelHostRequired: "Gel host is required",
  gelPortInt: "Port must be an integer",
  gelPortMin: "Port must be greater than 0",
  gelPortMax: "Port must be less than 65536",
  gelUserRequired: "Gel username is required",
  gelPasswordRequired: "Gel password is required",
  gelBranchFormat:
    "Branch name must contain only letters, numbers, underscores, and hyphens",
  gelTlsCaFileFormat: "Must be a valid file path",
  gelClientTlsSecurityInvalid:
    "TLS security must be one of: strict, no_host_verification, insecure",
  gelCredentialsFileFormat: "Must be a valid file path",
} as const;

export const defaults = {
  gelPort: 5656,
  gelUser: "admin",
  gelBranch: "main",
  gelClientTlsSecurity: "strict" as const,
} as const;

export const constraints = {
  gelPortMin: 1,
  gelPortMax: 65535,
} as const;

export const patterns = {
  gelDsn:
    /^gel:\/\/(?:[^:@/]+(?::[^@/]*)?@)?[^:/]+(?::\d+)?(?:\/[^?]*)?(?:\?.*)?$/,
  gelInstance: /^[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+$/,
  gelBranch: /^[a-zA-Z0-9_-]+$/,
} as const;

