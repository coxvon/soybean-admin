import { getServiceEnvConfig } from '~/.env-config';
import { createRequest } from './request';

const { url, proxyPattern } = getServiceEnvConfig(import.meta.env);

const isHttpProxy = import.meta.env.VITE_HTTP_PROXY === 'Y';

export const request = createRequest({ baseURL: isHttpProxy ? proxyPattern : url });
export const requestX = createRequest({
  baseURL: isHttpProxy ? proxyPattern : url,
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
});

export const mockRequest = createRequest({ baseURL: '/mock' });
