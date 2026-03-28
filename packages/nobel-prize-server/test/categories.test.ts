import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NobelPrizeClient } from '../src/api/client.js'
import { nobelListCategories, nobelGetCategoryStats } from '../src/tools/categories.js'
import type { NobelConfig } from '../src/api/types.js'

const mockConfig: NobelConfig = {
  baseUrl: 'https://api.nobelprize.org/2.1',
  cacheTtlMs: 86400000,
  cacheMaxSize: 200,
  timeoutMs: 10000,
  language: 'en',
  perPage: 25,
}

function makePrizesResponse(prizes: unknown[] = [], count = 0) {
  return { nobelPrizes: prizes, meta: { offset: 0, limit: 100, count } }
}

describe('Category Tools', () => {
  let client: NobelPrizeClient

  beforeEach(() => {
    client = new NobelPrizeClient(mockConfig)
    vi.restoreAllMocks()
  })

  describe('nobelListCategories', () => {
    it('should list all categories', async () => {
      // Each category makes 2 calls: getPrizes (limit 1) + getAllPrizes (paginated)
      // 6 categories = 12+ calls
      const fetchSpy = vi.spyOn(globalThis, 'fetch')

      // For each of the 6 categories: first call returns count, second returns data, third returns empty (end pagination)
      for (let i = 0; i < 6; i++) {
        // getPrizes call (limit 1)
        fetchSpy.mockResolvedValueOnce({
          ok: true,
          json: () =>
            Promise.resolve(
              makePrizesResponse(
                [
                  {
                    awardYear: '2023',
                    category: { en: 'Test' },
                    categoryFullName: { en: 'Test Prize' },
                    prizeAmount: 10000000,
                    prizeAmountAdjusted: 10000000,
                    laureates: [
                      {
                        id: '1',
                        knownName: { en: 'Test Person' },
                        fullName: { en: 'Test Person' },
                        portion: '1',
                        sortOrder: '1',
                        motivation: { en: 'for testing' },
                      },
                    ],
                  },
                ],
                5,
              ),
            ),
        } as Response)

        // getAllPrizes first page
        fetchSpy.mockResolvedValueOnce({
          ok: true,
          json: () =>
            Promise.resolve(
              makePrizesResponse(
                [
                  {
                    awardYear: '2023',
                    category: { en: 'Test' },
                    categoryFullName: { en: 'Test Prize' },
                    prizeAmount: 10000000,
                    prizeAmountAdjusted: 10000000,
                    laureates: [
                      {
                        id: '1',
                        knownName: { en: 'Test Person' },
                        fullName: { en: 'Test Person' },
                        portion: '1',
                        sortOrder: '1',
                        motivation: { en: 'for testing' },
                      },
                    ],
                  },
                ],
                1,
              ),
            ),
        } as Response)
      }

      const result = await nobelListCategories(client)
      expect(result).toContain('Nobel Prize Categories')
      expect(result).toContain('Physics')
      expect(result).toContain('Chemistry')
      expect(result).toContain('Peace')
    })
  })

  describe('nobelGetCategoryStats', () => {
    it('should return stats for physics', async () => {
      vi.spyOn(globalThis, 'fetch')
        .mockResolvedValueOnce({
          ok: true,
          json: () =>
            Promise.resolve(
              makePrizesResponse(
                [
                  {
                    awardYear: '2023',
                    category: { en: 'Physics' },
                    categoryFullName: { en: 'The Nobel Prize in Physics' },
                    prizeAmount: 11000000,
                    prizeAmountAdjusted: 11000000,
                    laureates: [
                      {
                        id: '1',
                        knownName: { en: 'Person A' },
                        fullName: { en: 'Person A' },
                        portion: '1/2',
                        sortOrder: '1',
                        motivation: { en: 'for work' },
                      },
                      {
                        id: '2',
                        knownName: { en: 'Person B' },
                        fullName: { en: 'Person B' },
                        portion: '1/2',
                        sortOrder: '2',
                        motivation: { en: 'for work' },
                      },
                    ],
                  },
                  {
                    awardYear: '1901',
                    category: { en: 'Physics' },
                    categoryFullName: { en: 'The Nobel Prize in Physics' },
                    prizeAmount: 100000,
                    prizeAmountAdjusted: 100000,
                    laureates: [
                      {
                        id: '3',
                        knownName: { en: 'Person C' },
                        fullName: { en: 'Person C' },
                        portion: '1',
                        sortOrder: '1',
                        motivation: { en: 'for discovery' },
                      },
                    ],
                  },
                ],
                2,
              ),
            ),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(makePrizesResponse([], 0)),
        } as Response)

      const result = await nobelGetCategoryStats(client, { category: 'phy' })
      expect(result).toContain('Physics')
      expect(result).toContain('Total prizes awarded: 2')
      expect(result).toContain('Total laureates: 3')
      expect(result).toContain('Shared prizes: 1')
      expect(result).toContain('2020s: 1')
      expect(result).toContain('1900s: 1')
    })
  })
})
