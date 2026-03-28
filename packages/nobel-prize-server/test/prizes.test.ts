import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NobelPrizeClient } from '../src/api/client.js'
import { nobelGetPrizes, nobelGetPrizeByYear } from '../src/tools/prizes.js'
import type { NobelConfig } from '../src/api/types.js'
import prizes2023Fixture from './fixtures/prizes-2023.json'

const mockConfig: NobelConfig = {
  baseUrl: 'https://api.nobelprize.org/2.1',
  cacheTtlMs: 86400000,
  cacheMaxSize: 200,
  timeoutMs: 10000,
  language: 'en',
  perPage: 25,
}

describe('Prize Tools', () => {
  let client: NobelPrizeClient

  beforeEach(() => {
    client = new NobelPrizeClient(mockConfig)
    vi.restoreAllMocks()
  })

  describe('nobelGetPrizes', () => {
    it('should fetch prizes by year', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(prizes2023Fixture),
      } as Response)

      const result = await nobelGetPrizes(client, { year: 2023, limit: 10 })
      expect(result).toContain('2023')
      expect(result).toContain('Physics')
    })

    it('should handle empty results', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ nobelPrizes: [], meta: { offset: 0, limit: 25, count: 0 } }),
      } as Response)

      const result = await nobelGetPrizes(client, { year: 1800, limit: 10 })
      expect(result).toContain('No prizes found')
    })
  })

  describe('nobelGetPrizeByYear', () => {
    it('should list all prizes for a year', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(prizes2023Fixture),
      } as Response)

      const result = await nobelGetPrizeByYear(client, { year: 2023 })
      expect(result).toContain('Nobel Prizes in 2023')
      expect(result).toContain('Physics')
      expect(result).toContain('Chemistry')
    })

    it('should handle year with no prizes', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ nobelPrizes: [], meta: { offset: 0, limit: 25, count: 0 } }),
      } as Response)

      const result = await nobelGetPrizeByYear(client, { year: 1940 })
      expect(result).toContain('No Nobel Prizes were awarded in 1940')
    })
  })
})
