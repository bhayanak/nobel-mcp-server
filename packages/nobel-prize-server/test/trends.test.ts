import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NobelPrizeClient } from '../src/api/client.js'
import { nobelGetTrends } from '../src/tools/trends.js'
import type { NobelConfig } from '../src/api/types.js'

const mockConfig: NobelConfig = {
  baseUrl: 'https://api.nobelprize.org/2.1',
  cacheTtlMs: 86400000,
  cacheMaxSize: 200,
  timeoutMs: 10000,
  language: 'en',
  perPage: 25,
}

function makeLaureatesResponse(laureates: unknown[]) {
  return { laureates, meta: { offset: 0, limit: 100, count: laureates.length } }
}

function makePrizesResponse(prizes: unknown[]) {
  return { nobelPrizes: prizes, meta: { offset: 0, limit: 100, count: prizes.length } }
}

describe('Trends Tools', () => {
  let client: NobelPrizeClient

  beforeEach(() => {
    client = new NobelPrizeClient(mockConfig)
    vi.restoreAllMocks()
  })

  describe('gender trend', () => {
    it('should compute gender distribution by decade', async () => {
      vi.spyOn(globalThis, 'fetch')
        .mockResolvedValueOnce({
          ok: true,
          json: () =>
            Promise.resolve(
              makeLaureatesResponse([
                {
                  id: '1',
                  knownName: { en: 'Male 1' },
                  gender: 'male',
                  birth: { date: '1900-01-01' },
                  nobelPrizes: [
                    {
                      awardYear: '1930',
                      category: { en: 'Physics' },
                      categoryFullName: { en: 'Physics' },
                      portion: '1',
                      prizeStatus: 'received',
                      motivation: { en: 'test' },
                      prizeAmount: 0,
                      prizeAmountAdjusted: 0,
                    },
                  ],
                },
                {
                  id: '2',
                  knownName: { en: 'Female 1' },
                  gender: 'female',
                  birth: { date: '1910-01-01' },
                  nobelPrizes: [
                    {
                      awardYear: '1935',
                      category: { en: 'Chemistry' },
                      categoryFullName: { en: 'Chemistry' },
                      portion: '1',
                      prizeStatus: 'received',
                      motivation: { en: 'test' },
                      prizeAmount: 0,
                      prizeAmountAdjusted: 0,
                    },
                  ],
                },
                {
                  id: '3',
                  knownName: { en: 'Female 2' },
                  gender: 'female',
                  birth: { date: '1960-01-01' },
                  nobelPrizes: [
                    {
                      awardYear: '2020',
                      category: { en: 'Physics' },
                      categoryFullName: { en: 'Physics' },
                      portion: '1/2',
                      prizeStatus: 'received',
                      motivation: { en: 'test' },
                      prizeAmount: 0,
                      prizeAmountAdjusted: 0,
                    },
                  ],
                },
              ]),
            ),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(makeLaureatesResponse([])),
        } as Response)

      const result = await nobelGetTrends(client, { metric: 'gender' })
      expect(result).toContain('Gender Distribution')
      expect(result).toContain('Male')
      expect(result).toContain('Female')
      expect(result).toContain('1930–1939')
    })
  })

  describe('shared trend', () => {
    it('should compute shared vs sole prizes', async () => {
      vi.spyOn(globalThis, 'fetch')
        .mockResolvedValueOnce({
          ok: true,
          json: () =>
            Promise.resolve(
              makePrizesResponse([
                {
                  awardYear: '2020',
                  category: { en: 'Physics' },
                  categoryFullName: { en: 'Physics' },
                  prizeAmount: 10000000,
                  prizeAmountAdjusted: 10000000,
                  laureates: [
                    {
                      id: '1',
                      knownName: { en: 'A' },
                      portion: '1/2',
                      sortOrder: '1',
                      motivation: { en: 'test' },
                    },
                    {
                      id: '2',
                      knownName: { en: 'B' },
                      portion: '1/2',
                      sortOrder: '2',
                      motivation: { en: 'test' },
                    },
                  ],
                },
                {
                  awardYear: '1905',
                  category: { en: 'Physics' },
                  categoryFullName: { en: 'Physics' },
                  prizeAmount: 100000,
                  prizeAmountAdjusted: 100000,
                  laureates: [
                    {
                      id: '3',
                      knownName: { en: 'C' },
                      portion: '1',
                      sortOrder: '1',
                      motivation: { en: 'test' },
                    },
                  ],
                },
              ]),
            ),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(makePrizesResponse([])),
        } as Response)

      const result = await nobelGetTrends(client, { metric: 'shared' })
      expect(result).toContain('Shared vs Sole Prizes')
      expect(result).toContain('Sole')
      expect(result).toContain('Shared')
    })
  })

  describe('age trend', () => {
    it('should compute average age at award', async () => {
      vi.spyOn(globalThis, 'fetch')
        .mockResolvedValueOnce({
          ok: true,
          json: () =>
            Promise.resolve(
              makeLaureatesResponse([
                {
                  id: '1',
                  knownName: { en: 'Person 1' },
                  gender: 'male',
                  birth: { date: '1960-01-01' },
                  nobelPrizes: [
                    {
                      awardYear: '2020',
                      category: { en: 'Physics' },
                      categoryFullName: { en: 'Physics' },
                      portion: '1',
                      prizeStatus: 'received',
                      motivation: { en: 'test' },
                      prizeAmount: 0,
                      prizeAmountAdjusted: 0,
                    },
                  ],
                },
                {
                  id: '2',
                  knownName: { en: 'Person 2' },
                  gender: 'female',
                  birth: { date: '1980-06-15' },
                  nobelPrizes: [
                    {
                      awardYear: '2023',
                      category: { en: 'Chemistry' },
                      categoryFullName: { en: 'Chemistry' },
                      portion: '1',
                      prizeStatus: 'received',
                      motivation: { en: 'test' },
                      prizeAmount: 0,
                      prizeAmountAdjusted: 0,
                    },
                  ],
                },
              ]),
            ),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(makeLaureatesResponse([])),
        } as Response)

      const result = await nobelGetTrends(client, { metric: 'age' })
      expect(result).toContain('Average Age at Award')
      expect(result).toContain('Avg Age')
    })
  })

  describe('country trend', () => {
    it('should show top countries per decade', async () => {
      vi.spyOn(globalThis, 'fetch')
        .mockResolvedValueOnce({
          ok: true,
          json: () =>
            Promise.resolve(
              makePrizesResponse([
                {
                  awardYear: '2020',
                  category: { en: 'Physics' },
                  categoryFullName: { en: 'Physics' },
                  prizeAmount: 10000000,
                  prizeAmountAdjusted: 10000000,
                  laureates: [
                    {
                      id: '1',
                      knownName: { en: 'Person A' },
                      portion: '1',
                      sortOrder: '1',
                      motivation: { en: 'test' },
                      affiliations: [{ name: { en: 'MIT' }, country: { en: 'USA' } }],
                    },
                  ],
                },
              ]),
            ),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(makePrizesResponse([])),
        } as Response)

      const result = await nobelGetTrends(client, { metric: 'country' })
      expect(result).toContain('Country Distribution')
      expect(result).toContain('USA')
    })
  })
})
