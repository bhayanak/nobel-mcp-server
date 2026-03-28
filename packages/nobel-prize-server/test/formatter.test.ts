import { describe, it, expect } from 'vitest'
import { NobelFormatter } from '../src/utils/formatter.js'
import type {
  Laureate,
  NobelPrize,
  CategoryStats,
  CountryStats,
  TrendData,
} from '../src/api/types.js'

describe('NobelFormatter', () => {
  describe('formatLaureate', () => {
    it('should format a complete laureate', () => {
      const laureate: Laureate = {
        id: '26',
        knownName: { en: 'Albert Einstein' },
        fullName: { en: 'Albert Einstein' },
        gender: 'male',
        birth: {
          date: '1879-03-14',
          place: {
            city: { en: 'Ulm' },
            country: { en: 'Germany' },
          },
        },
        death: {
          date: '1955-04-18',
          place: {
            city: { en: 'Princeton, NJ' },
            country: { en: 'USA' },
          },
        },
        nobelPrizes: [
          {
            awardYear: '1921',
            category: { en: 'Physics' },
            categoryFullName: { en: 'The Nobel Prize in Physics' },
            sortOrder: '1',
            portion: '1',
            prizeStatus: 'received',
            motivation: { en: 'for his discovery of the law of the photoelectric effect' },
            prizeAmount: 121573,
            prizeAmountAdjusted: 4020000,
            affiliations: [
              {
                name: { en: 'Kaiser-Wilhelm-Institut' },
                city: { en: 'Berlin' },
                country: { en: 'Germany' },
              },
            ],
          },
        ],
      }

      const result = NobelFormatter.formatLaureate(laureate)
      expect(result).toContain('🏆 Albert Einstein (1879–1955)')
      expect(result).toContain('Born: 1879-03-14, Ulm, Germany')
      expect(result).toContain('Nobel Prize in The Nobel Prize in Physics, 1921')
      expect(result).toContain('photoelectric effect')
      expect(result).toContain('sole recipient')
      expect(result).toContain('Kaiser-Wilhelm-Institut')
    })

    it('should handle laureate without death date', () => {
      const laureate: Laureate = {
        id: '1',
        knownName: { en: 'Living Person' },
        fullName: { en: 'Living Person' },
        gender: 'female',
        birth: { date: '1980-01-01' },
        nobelPrizes: [],
      }

      const result = NobelFormatter.formatLaureate(laureate)
      expect(result).toContain('1980–present')
    })

    it('should fallback to category when categoryFullName is N/A', () => {
      const laureate: Laureate = {
        id: '2',
        knownName: { en: 'Fallback Cat' },
        fullName: { en: 'Fallback Cat' },
        gender: 'male',
        birth: { date: '1900-01-01' },
        nobelPrizes: [
          {
            awardYear: '1950',
            category: { en: 'Physics' },
            sortOrder: '1',
            portion: '1/3',
            prizeStatus: 'received',
            motivation: { en: 'test' },
            prizeAmount: 0,
            prizeAmountAdjusted: 0,
          },
        ],
      }

      const result = NobelFormatter.formatLaureate(laureate)
      expect(result).toContain('Nobel Prize in Physics, 1950')
    })
  })

  describe('formatPrize', () => {
    it('should format prize with laureates', () => {
      const prize: NobelPrize = {
        awardYear: '2023',
        category: { en: 'Physics' },
        categoryFullName: { en: 'The Nobel Prize in Physics' },
        prizeAmount: 11000000,
        prizeAmountAdjusted: 11000000,
        laureates: [
          {
            id: '1',
            knownName: { en: 'Jane Doe' },
            fullName: { en: 'Jane Doe' },
            portion: '1/2',
            sortOrder: '1',
            motivation: { en: 'for outstanding research' },
          },
          {
            id: '2',
            knownName: { en: 'John Smith' },
            fullName: { en: 'John Smith' },
            portion: '1/2',
            sortOrder: '2',
            motivation: { en: 'for outstanding research' },
          },
        ],
      }

      const result = NobelFormatter.formatPrize(prize)
      expect(result).toContain('2023 — The Nobel Prize in Physics')
      expect(result).toContain('Jane Doe (1/2)')
      expect(result).toContain('John Smith (1/2)')
      expect(result).toContain('outstanding research')
    })

    it('should handle prize with no laureates', () => {
      const prize: NobelPrize = {
        awardYear: '1940',
        category: { en: 'Physics' },
        categoryFullName: { en: 'The Nobel Prize in Physics' },
        prizeAmount: 0,
        prizeAmountAdjusted: 0,
      }

      const result = NobelFormatter.formatPrize(prize)
      expect(result).toContain('No laureates awarded')
    })

    it('should fallback to category when categoryFullName is missing', () => {
      const prize: NobelPrize = {
        awardYear: '1942',
        category: { en: 'Chemistry' },
        prizeAmount: 0,
        prizeAmountAdjusted: 0,
      }

      const result = NobelFormatter.formatPrize(prize)
      expect(result).toContain('1942 — Chemistry')
    })
  })

  describe('formatCategories', () => {
    it('should produce a table with totals', () => {
      const cats: CategoryStats[] = [
        {
          code: 'phy',
          name: 'Physics',
          firstAward: 1901,
          totalPrizes: 117,
          totalLaureates: 222,
          totalOrganizations: 0,
        },
        {
          code: 'pea',
          name: 'Peace',
          firstAward: 1901,
          totalPrizes: 104,
          totalLaureates: 112,
          totalOrganizations: 29,
        },
      ]

      const result = NobelFormatter.formatCategories(cats)
      expect(result).toContain('Nobel Prize Categories')
      expect(result).toContain('Physics')
      expect(result).toContain('Peace')
      expect(result).toContain('Total')
    })
  })

  describe('formatCountryRanking', () => {
    it('should produce a ranked country table', () => {
      const stats: CountryStats[] = [
        { country: 'United States', total: 400, byCategory: { phy: 100, che: 80 } },
        { country: 'United Kingdom', total: 137, byCategory: { phy: 35 } },
      ]

      const result = NobelFormatter.formatCountryRanking(stats)
      expect(result).toContain('United States')
      expect(result).toContain('United Kingdom')
      expect(result).toContain('400')
    })
  })

  describe('formatLaureate – org type', () => {
    it('should skip birth/death place for organizations', () => {
      const org: Laureate = {
        id: '500',
        knownName: { en: 'Red Cross' },
        fullName: { en: 'International Red Cross' },
        gender: 'org',
        birth: {
          date: '1863-02-17',
          place: { city: { en: 'Geneva' }, country: { en: 'Switzerland' } },
        },
        nobelPrizes: [],
      }
      const result = NobelFormatter.formatLaureate(org)
      expect(result).toContain('Red Cross')
      expect(result).not.toContain('Born:')
    })
  })

  describe('formatLaureate – died without place', () => {
    it('should show death date without location when place is missing', () => {
      const laureate: Laureate = {
        id: '99',
        knownName: { en: 'John Doe' },
        fullName: { en: 'John Doe' },
        gender: 'male',
        birth: {
          date: '1900-01-01',
          place: { city: { en: 'Berlin' }, country: { en: 'Germany' } },
        },
        death: { date: '1970-06-15' },
        nobelPrizes: [],
      }
      const result = NobelFormatter.formatLaureate(laureate)
      expect(result).toContain('Died: 1970-06-15')
      expect(result).not.toContain('Died: 1970-06-15,')
    })
  })

  describe('formatLaureate – portion variants', () => {
    it('should handle 1/4 and unusual portions', () => {
      const laureate: Laureate = {
        id: '200',
        knownName: { en: 'Quarter Winner' },
        fullName: { en: 'Quarter Winner' },
        gender: 'male',
        birth: { date: '1950-01-01' },
        nobelPrizes: [
          {
            awardYear: '2000',
            category: { en: 'Chemistry' },
            categoryFullName: { en: 'Chemistry' },
            sortOrder: '1',
            portion: '1/4',
            prizeStatus: 'received',
            motivation: { en: 'test' },
            prizeAmount: 1000,
            prizeAmountAdjusted: 1000,
          },
        ],
      }
      const result = NobelFormatter.formatLaureate(laureate)
      expect(result).toContain('1/4')
    })

    it('should handle default/unknown portion', () => {
      const laureate: Laureate = {
        id: '201',
        knownName: { en: 'Unusual Winner' },
        fullName: { en: 'Unusual Winner' },
        gender: 'male',
        birth: { date: '1950-01-01' },
        nobelPrizes: [
          {
            awardYear: '2001',
            category: { en: 'Physics' },
            categoryFullName: { en: 'Physics' },
            sortOrder: '1',
            portion: '2/5',
            prizeStatus: 'received',
            motivation: { en: 'test' },
            prizeAmount: 1000,
            prizeAmountAdjusted: 1000,
          },
        ],
      }
      const result = NobelFormatter.formatLaureate(laureate)
      expect(result).toContain('2/5')
    })
  })

  describe('formatPrize – topMotivation', () => {
    it('should show topMotivation when no laureates', () => {
      const prize: NobelPrize = {
        awardYear: '1939',
        category: { en: 'Peace' },
        categoryFullName: { en: 'The Nobel Peace Prize' },
        prizeAmount: 0,
        prizeAmountAdjusted: 0,
        topMotivation: { en: 'for exceptional peacemaking' },
      }
      const result = NobelFormatter.formatPrize(prize)
      expect(result).toContain('exceptional peacemaking')
      expect(result).not.toContain('No laureates awarded')
    })
  })

  describe('formatPrizeList', () => {
    it('should format without total parameter', () => {
      const prizes: NobelPrize[] = [
        {
          awardYear: '2020',
          category: { en: 'Literature' },
          categoryFullName: { en: 'Literature' },
          prizeAmount: 10000000,
          prizeAmountAdjusted: 10000000,
          laureates: [
            {
              id: '1',
              knownName: { en: 'Author' },
              fullName: { en: 'Author' },
              portion: '1',
              sortOrder: '1',
              motivation: { en: 'for poetry' },
            },
          ],
        },
      ]
      const result = NobelFormatter.formatPrizeList(prizes)
      expect(result).not.toContain('total')
      expect(result).toContain('2020')
    })

    it('should format with total parameter', () => {
      const prizes: NobelPrize[] = [
        {
          awardYear: '2020',
          category: { en: 'Literature' },
          categoryFullName: { en: 'Literature' },
          prizeAmount: 10000000,
          prizeAmountAdjusted: 10000000,
        },
      ]
      const result = NobelFormatter.formatPrizeList(prizes, 5)
      expect(result).toContain('Nobel Prizes (5 total)')
    })
  })

  describe('formatTrend', () => {
    it('should format trend with known category', () => {
      const data: TrendData = {
        metric: 'Gender',
        category: 'phy',
        decades: [{ label: '2000s', values: { male: 20, female: 3 } }],
        summary: 'Physics gender gap.',
      }
      const result = NobelFormatter.formatTrend(data)
      expect(result).toContain('Physics')
      expect(result).toContain('Gender Trends')
      expect(result).toContain('Physics gender gap.')
    })

    it('should format trend with unknown category code', () => {
      const data: TrendData = {
        metric: 'Age',
        category: 'xyz',
        decades: [{ label: '1990s', values: { avg: 55 } }],
      }
      const result = NobelFormatter.formatTrend(data)
      expect(result).toContain('Age Trends — xyz')
    })

    it('should format trend without category', () => {
      const data: TrendData = {
        metric: 'Shared',
        decades: [{ label: '2010s', values: { shared: 8, sole: 2 } }],
      }
      const result = NobelFormatter.formatTrend(data)
      expect(result).toContain('All Categories')
    })
  })

  describe('sparkline', () => {
    it('should generate sparkline characters', () => {
      const result = NobelFormatter.sparkline([1, 3, 5, 7, 10])
      expect(result).toHaveLength(5)
      expect(result[0]).not.toBe(result[4])
    })

    it('should handle empty input', () => {
      expect(NobelFormatter.sparkline([])).toBe('')
    })

    it('should handle all zeros', () => {
      const result = NobelFormatter.sparkline([0, 0, 0])
      expect(result).toHaveLength(3)
    })
  })
})
