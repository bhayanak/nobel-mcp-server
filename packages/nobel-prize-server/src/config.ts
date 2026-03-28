import type { NobelConfig } from './api/types.js'

export function loadConfig(): NobelConfig {
  return {
    baseUrl: process.env.NOBEL_MCP_BASE_URL ?? 'https://api.nobelprize.org/2.1',
    cacheTtlMs: parseInt(process.env.NOBEL_MCP_CACHE_TTL_MS ?? '86400000', 10),
    cacheMaxSize: parseInt(process.env.NOBEL_MCP_CACHE_MAX_SIZE ?? '200', 10),
    timeoutMs: parseInt(process.env.NOBEL_MCP_TIMEOUT_MS ?? '10000', 10),
    language: process.env.NOBEL_MCP_LANGUAGE ?? 'en',
    perPage: parseInt(process.env.NOBEL_MCP_PER_PAGE ?? '25', 10),
  }
}
