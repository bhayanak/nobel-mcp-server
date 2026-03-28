import { describe, it, expect } from 'vitest'
import { loadConfig } from '../src/config.js'

describe('loadConfig', () => {
  it('should return default config values', () => {
    const config = loadConfig()
    expect(config.baseUrl).toBe('https://api.nobelprize.org/2.1')
    expect(config.cacheTtlMs).toBe(86400000)
    expect(config.cacheMaxSize).toBe(200)
    expect(config.timeoutMs).toBe(10000)
    expect(config.language).toBe('en')
    expect(config.perPage).toBe(25)
  })

  it('should respect environment variables', () => {
    const orig = process.env.NOBEL_MCP_TIMEOUT_MS
    process.env.NOBEL_MCP_TIMEOUT_MS = '5000'
    const config = loadConfig()
    expect(config.timeoutMs).toBe(5000)
    if (orig === undefined) {
      delete process.env.NOBEL_MCP_TIMEOUT_MS
    } else {
      process.env.NOBEL_MCP_TIMEOUT_MS = orig
    }
  })
})
