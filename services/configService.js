import envConfig from '@/env-config.json';
import apiCatalog from '@/api-catalog.json';

export function getEnvironments() {
  return envConfig.environments.map(e => ({ id: e.categoryId, values: e.categoryValues }));
}

export function getEnvPermissions(env) {
  const found = envConfig.environments.find(e => e.categoryId === env);
  return found ? found.categoryValues : {};
}

export function getApiCatalog() {
  return apiCatalog;
}
