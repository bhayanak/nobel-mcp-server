import { z } from 'zod'
import type { NobelPrizeClient } from '../api/client.js'
import { NobelFormatter } from '../utils/formatter.js'

import type { TrendData, TrendDecade } from '../api/types.js'

export const nobelGetTrendsSchema = z.object({
  metric: z
    .enum(['age', 'gender', 'shared', 'country'])
    .describe(
      "Trend metric: 'age' for average age over time, 'gender' for gender distribution, 'shared' for shared vs sole prizes, 'country' for country distribution shifts",
    ),
  category: z.enum(['phy', 'che', 'med', 'lit', 'pea', 'eco']).optional(),
  decade: z.number().optional().describe('Specific decade (e.g., 1960, 2000)'),
})

export async function nobelGetTrends(
  client: NobelPrizeClient,
  args: z.infer<typeof nobelGetTrendsSchema>,
): Promise<string> {
  const { metric, category, decade } = args

  switch (metric) {
    case 'gender':
      return genderTrend(client, category, decade)
    case 'shared':
      return sharedTrend(client, category, decade)
    case 'age':
      return ageTrend(client, category, decade)
    case 'country':
      return countryTrend(client, category, decade)
    default:
      return 'Unknown metric.'
  }
}

async function genderTrend(
  client: NobelPrizeClient,
  category?: string,
  decade?: number,
): Promise<string> {
  const laureates = await client.getAllLaureates(
    category ? { nobelPrizeCategory: category } : undefined,
  )

  const decadeMap = new Map<string, { male: number; female: number }>()

  for (const l of laureates) {
    if (!l.nobelPrizes) continue

    for (const prize of l.nobelPrizes) {
      const year = parseInt(prize.awardYear)
      const d = Math.floor(year / 10) * 10
      if (decade && d !== decade) continue

      const label = `${d}–${d + 9}`
      const entry = decadeMap.get(label) ?? { male: 0, female: 0 }

      if (l.gender === 'female') {
        entry.female++
      } else if (l.gender === 'male') {
        entry.male++
      }

      decadeMap.set(label, entry)
    }
  }

  const decades: TrendDecade[] = [...decadeMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([label, v]) => ({
      label,
      values: {
        Male: v.male,
        Female: v.female,
        '% Female': Math.round((v.female / (v.male + v.female || 1)) * 1000) / 10,
      },
    }))

  const totalFemale = decades.reduce((s, d) => s + (d.values['Female'] ?? 0), 0)
  const totalAll = decades.reduce(
    (s, d) => s + (d.values['Male'] ?? 0) + (d.values['Female'] ?? 0),
    0,
  )
  const femaleValues = decades.map((d) => d.values['Female'] ?? 0)

  const data: TrendData = {
    metric: 'Gender Distribution',
    category,
    decades,
    summary: `Total: ${totalFemale} female laureates (${totalAll > 0 ? ((totalFemale / totalAll) * 100).toFixed(1) : 0}% of all)\nRecent trend: ${NobelFormatter.sparkline(femaleValues)}`,
  }

  return NobelFormatter.formatTrend(data)
}

async function sharedTrend(
  client: NobelPrizeClient,
  category?: string,
  decade?: number,
): Promise<string> {
  const prizes = await client.getAllPrizes(category)

  const decadeMap = new Map<string, { sole: number; shared: number }>()

  for (const prize of prizes) {
    const year = parseInt(prize.awardYear)
    const d = Math.floor(year / 10) * 10
    if (decade && d !== decade) continue

    const label = `${d}–${d + 9}`
    const entry = decadeMap.get(label) ?? { sole: 0, shared: 0 }

    if (prize.laureates && prize.laureates.length > 1) {
      entry.shared++
    } else {
      entry.sole++
    }

    decadeMap.set(label, entry)
  }

  const decades: TrendDecade[] = [...decadeMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([label, v]) => ({
      label,
      values: {
        Sole: v.sole,
        Shared: v.shared,
        '% Shared': Math.round((v.shared / (v.sole + v.shared || 1)) * 1000) / 10,
      },
    }))

  const sharedValues = decades.map((d) => d.values['Shared'] ?? 0)

  const data: TrendData = {
    metric: 'Shared vs Sole Prizes',
    category,
    decades,
    summary: `Trend: ${NobelFormatter.sparkline(sharedValues)} (increasing sharing over time)`,
  }

  return NobelFormatter.formatTrend(data)
}

async function ageTrend(
  client: NobelPrizeClient,
  category?: string,
  decade?: number,
): Promise<string> {
  const laureates = await client.getAllLaureates(
    category ? { nobelPrizeCategory: category } : undefined,
  )

  const decadeMap = new Map<string, number[]>()

  for (const l of laureates) {
    if (!l.birth?.date || !l.nobelPrizes) continue

    const birthYear = parseInt(l.birth.date.slice(0, 4))
    if (isNaN(birthYear)) continue

    for (const prize of l.nobelPrizes) {
      const awardYear = parseInt(prize.awardYear)
      const d = Math.floor(awardYear / 10) * 10
      if (decade && d !== decade) continue

      const age = awardYear - birthYear
      if (age < 0 || age > 120) continue

      const label = `${d}–${d + 9}`
      const ages = decadeMap.get(label) ?? []
      ages.push(age)
      decadeMap.set(label, ages)
    }
  }

  const decades: TrendDecade[] = [...decadeMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([label, ages]) => {
      const avg = Math.round(ages.reduce((s, a) => s + a, 0) / ages.length)
      const youngest = Math.min(...ages)
      const oldest = Math.max(...ages)
      return {
        label,
        values: { 'Avg Age': avg, Youngest: youngest, Oldest: oldest, Count: ages.length },
      }
    })

  const avgAges = decades.map((d) => d.values['Avg Age'] ?? 0)

  const data: TrendData = {
    metric: 'Average Age at Award',
    category,
    decades,
    summary: `Age trend: ${NobelFormatter.sparkline(avgAges)} (generally increasing)`,
  }

  return NobelFormatter.formatTrend(data)
}

async function countryTrend(
  client: NobelPrizeClient,
  category?: string,
  decade?: number,
): Promise<string> {
  const prizes = await client.getAllPrizes(category)

  const decadeMap = new Map<string, Map<string, number>>()

  for (const prize of prizes) {
    const year = parseInt(prize.awardYear)
    const d = Math.floor(year / 10) * 10
    if (decade && d !== decade) continue

    const label = `${d}–${d + 9}`
    const countries = decadeMap.get(label) ?? new Map<string, number>()

    if (prize.laureates) {
      for (const l of prize.laureates) {
        if (l.affiliations) {
          for (const aff of l.affiliations) {
            const country = aff.country?.en
            if (country) {
              countries.set(country, (countries.get(country) ?? 0) + 1)
            }
          }
        }
      }
    }

    decadeMap.set(label, countries)
  }

  const decades: TrendDecade[] = [...decadeMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([label, countries]) => {
      const top3 = [...countries.entries()].sort(([, a], [, b]) => b - a).slice(0, 3)
      const values: Record<string, number> = {}
      for (const [country, count] of top3) {
        values[country] = count
      }
      return { label, values }
    })

  const data: TrendData = {
    metric: 'Country Distribution (Top 3 per Decade)',
    category,
    decades,
    summary: '',
  }

  return NobelFormatter.formatTrend(data)
}
