import { RABBITMQ_URL } from "./rabbitmqUrl";
import { MEMCACHED_SERVERS } from "./memcachedServers";

import { KUBERNETES_NAMESPACE } from "./kubernetesNamespace";
import { KUBERNETES_SERVICE_ACCOUNT } from "./kubernetesServiceAccount";
import { PROMETHEUS_PORT } from "./prometheusPort";
import { JAEGER_ENDPOINT } from "./jaegerEndpoint";
import { NEW_RELIC_LICENSE_KEY } from "./newRelicLicenseKey";
import { SENTRY_DSN } from "./sentryDsn";

export { rabbitmqUrlSchema, RABBITMQ_URL } from "./rabbitmqUrl";

export { memcachedServersSchema, MEMCACHED_SERVERS } from "./memcachedServers";

export { kubernetesNamespaceSchema, KUBERNETES_NAMESPACE } from "./kubernetesNamespace";
export { kubernetesServiceAccountSchema, KUBERNETES_SERVICE_ACCOUNT } from "./kubernetesServiceAccount";
export { prometheusPortSchema, PROMETHEUS_PORT } from "./prometheusPort";
export { jaegerEndpointSchema, JAEGER_ENDPOINT } from "./jaegerEndpoint";
export { newRelicLicenseKeySchema, NEW_RELIC_LICENSE_KEY } from "./newRelicLicenseKey";
export { sentryDsnSchema, SENTRY_DSN } from "./sentryDsn";

export const infrastructureSchemas = {
  RABBITMQ_URL,
  MEMCACHED_SERVERS,
  KUBERNETES_NAMESPACE,
  KUBERNETES_SERVICE_ACCOUNT,
  PROMETHEUS_PORT,
  JAEGER_ENDPOINT,
  NEW_RELIC_LICENSE_KEY,
  SENTRY_DSN,
} as const;
