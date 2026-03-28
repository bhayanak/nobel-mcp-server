import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NobelPrizeClient } from '../src/api/client.js'
import type { NobelConfig } from '../src/api/types.js'
import einsteinFixture from './fixtures/laureate-einstein.json'
import prizes2023Fixture from './fixtures/prizes-2023.json'

const mockConfig: NobelConfig = {
  baseUrl: 'https://api.nobelprize.org/2.1',
  cacheTtlMs: 86400000,
  cacheMaxSize: 200,
  timeoutMs: 10000,
  language: 'en',
  perPage: 25,
}

describe('NobelPrizeClient', () => {
  let client: NobelPrizeClient

  beforeEach(() => {
    client = new NobelPrizeClient(mockConfig)
    vi.restoreAllMocks()
  })

  it('should reject invalid base URLs', () => {
    expect(
      () =>
        new NobelPrizeClient({
          ...mockConfig,
          baseUrl: 'https://evil.example.com',
        }),
    ).toThrow('Base URL must start with')
  })

  it('should fetch laureate by ID', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(einsteinFixture),
    } as Response)

    const laureate = await client.getLaureate(26)
    expect(laureate.knownName?.en).toBe('Albert Einstein')
    expect(laureate.nobelPrizes?.[0].awardYear).toBe('1921')
  })

  it('should throw on 404', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    } as Response)

    await expect(client.getLaureate(99999)).rejects.toThrow('Nobel API request failed')
  })

  it('should search laureates', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(einsteinFixture),
    } as Response)

    const result = await client.searchLaureates({ name: 'Einstein' })
    expect(result.laureates).toHaveLength(1)
    expect(result.laureates[0].knownName?.en).toBe('Albert Einstein')
  })

  it('should fetch prizes', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(prizes2023Fixture),
    } as Response)

    const result = await client.getPrizes({ year: 2023 })
    expect(result.prizes).toHaveLength(2)
    expect(result.prizes[0].awardYear).toBe('2023')
  })

  it('should use cache on repeated requests', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(einsteinFixture),
    } as Response)

    await client.getLaureate(26)
    await client.getLaureate(26) // should be cached

    expect(fetchSpy).toHaveBeenCalledTimes(1)
  })
})
