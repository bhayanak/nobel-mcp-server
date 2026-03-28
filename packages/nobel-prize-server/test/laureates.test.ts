import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NobelPrizeClient } from '../src/api/client.js'
import { nobelGetLaureate, nobelSearchLaureates } from '../src/tools/laureates.js'
import type { NobelConfig } from '../src/api/types.js'
import einsteinFixture from './fixtures/laureate-einstein.json'

const mockConfig: NobelConfig = {
  baseUrl: 'https://api.nobelprize.org/2.1',
  cacheTtlMs: 86400000,
  cacheMaxSize: 200,
  timeoutMs: 10000,
  language: 'en',
  perPage: 25,
}

describe('Laureate Tools', () => {
  let client: NobelPrizeClient

  beforeEach(() => {
    client = new NobelPrizeClient(mockConfig)
    vi.restoreAllMocks()
  })

  describe('nobelGetLaureate', () => {
    it('should fetch laureate by numeric ID', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(einsteinFixture),
      } as Response)

      const result = await nobelGetLaureate(client, { nameOrId: 26 })
      expect(result).toContain('Albert Einstein')
      expect(result).toContain('1921')
      expect(result).toContain('photoelectric effect')
    })

    it('should fetch laureate by string ID', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(einsteinFixture),
      } as Response)

      const result = await nobelGetLaureate(client, { nameOrId: '26' })
      expect(result).toContain('Albert Einstein')
    })

    it('should search laureate by name', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(einsteinFixture),
      } as Response)

      const result = await nobelGetLaureate(client, { nameOrId: 'Einstein' })
      expect(result).toContain('Albert Einstein')
    })

    it('should show "not found" for empty results', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ laureates: [], meta: { offset: 0, limit: 25, count: 0 } }),
      } as Response)

      const result = await nobelGetLaureate(client, { nameOrId: 'NonExistent' })
      expect(result).toContain('No laureates found')
    })

    it('should show multiple matches when searching by name', async () => {
      const multipleResults = {
        laureates: [
          {
            id: '26',
            knownName: { en: 'Albert Einstein' },
            fullName: { en: 'Albert Einstein' },
            gender: 'male',
            birth: { date: '1879-03-14' },
            nobelPrizes: [
              {
                awardYear: '1921',
                category: { en: 'Physics' },
                categoryFullName: { en: 'The Nobel Prize in Physics' },
                sortOrder: '1',
                portion: '1',
                prizeStatus: 'received',
                motivation: { en: 'for photoelectric effect' },
                prizeAmount: 121573,
                prizeAmountAdjusted: 4020000,
              },
            ],
          },
          {
            id: '100',
            knownName: { en: 'Max Planck' },
            fullName: { en: 'Max Planck' },
            gender: 'male',
            birth: { date: '1858-04-23' },
            nobelPrizes: [
              {
                awardYear: '1918',
                category: { en: 'Physics' },
                categoryFullName: { en: 'The Nobel Prize in Physics' },
                sortOrder: '1',
                portion: '1',
                prizeStatus: 'received',
                motivation: { en: 'for quantum theory' },
                prizeAmount: 100000,
                prizeAmountAdjusted: 3000000,
              },
            ],
          },
          {
            id: '101',
            knownName: { en: 'Niels Bohr' },
            fullName: { en: 'Niels Bohr' },
            gender: 'male',
            birth: { date: '1885-10-07' },
            nobelPrizes: [
              {
                awardYear: '1922',
                category: { en: 'Physics' },
                categoryFullName: { en: 'The Nobel Prize in Physics' },
                sortOrder: '1',
                portion: '1',
                prizeStatus: 'received',
                motivation: { en: 'for atomic structure' },
                prizeAmount: 100000,
                prizeAmountAdjusted: 3000000,
              },
            ],
          },
        ],
        meta: { offset: 0, limit: 5, count: 3 },
      }

      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(multipleResults),
      } as Response)

      const result = await nobelGetLaureate(client, { nameOrId: 'physics' })
      expect(result).toContain('Albert Einstein')
      expect(result).toContain('Also found 2 other match(es)')
      expect(result).toContain('Max Planck')
      expect(result).toContain('Niels Bohr')
      expect(result).toContain('ID: 100')
      expect(result).toContain('ID: 101')
    })
  })

  describe('nobelSearchLaureates', () => {
    it('should search by name', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(einsteinFixture),
      } as Response)

      const result = await nobelSearchLaureates(client, { name: 'Einstein', limit: 20 })
      expect(result).toContain('Albert Einstein')
      expect(result).toContain('Found 1 laureate')
    })

    it('should handle empty results', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ laureates: [], meta: { offset: 0, limit: 25, count: 0 } }),
      } as Response)

      const result = await nobelSearchLaureates(client, {
        name: 'zzz',
        limit: 20,
      })
      expect(result).toContain('No laureates found')
    })
  })
})
