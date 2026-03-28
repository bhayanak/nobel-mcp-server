import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NobelPrizeClient } from '../src/api/client.js'
import { nobelGetCountryStats } from '../src/tools/countries.js'
import type { NobelConfig } from '../src/api/types.js'
import categoryPhysicsFixture from './fixtures/category-physics.json'

const mockConfig: NobelConfig = {
  baseUrl: 'https://api.nobelprize.org/2.1',
  cacheTtlMs: 86400000,
  cacheMaxSize: 200,
  timeoutMs: 10000,
  language: 'en',
  perPage: 25,
}

describe('Country Tools', () => {
  let client: NobelPrizeClient

  beforeEach(() => {
    client = new NobelPrizeClient(mockConfig)
    vi.restoreAllMocks()
  })

  it('should get country stats', async () => {
    // getAllPrizes calls multiple pages - mock returning then empty
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(categoryPhysicsFixture),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({ nobelPrizes: [], meta: { offset: 100, limit: 100, count: 0 } }),
      } as Response)

    const result = await nobelGetCountryStats(client, {
      category: 'phy',
      limit: 15,
    })
    expect(result).toContain('USA')
  })

  it('should filter by specific country', async () => {
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(categoryPhysicsFixture),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({ nobelPrizes: [], meta: { offset: 100, limit: 100, count: 0 } }),
      } as Response)

    const result = await nobelGetCountryStats(client, {
      country: 'USA',
      category: 'phy',
      limit: 15,
    })
    expect(result).toContain('USA')
  })

  it('should handle empty results', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ nobelPrizes: [], meta: { offset: 0, limit: 100, count: 0 } }),
    } as Response)

    const result = await nobelGetCountryStats(client, {
      country: 'Narnia',
      category: 'phy',
      limit: 15,
    })
    expect(result).toContain('No Nobel Prize data found')
  })
})
