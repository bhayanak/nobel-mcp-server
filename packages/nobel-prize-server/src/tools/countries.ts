import { z } from 'zod'
import type { NobelPrizeClient } from '../api/client.js'
import { NobelFormatter } from '../utils/formatter.js'
import { CATEGORY_CODES, CATEGORY_MAP } from '../utils/constants.js'
import type { CountryStats } from '../api/types.js'

export const nobelGetCountryStatsSchema = z.object({
  country: z
    .string()
    .optional()
    .describe('Specific country name (or omit for top countries ranking)'),
  category: z.enum(['phy', 'che', 'med', 'lit', 'pea', 'eco']).optional(),
  limit: z.number().min(1).max(50).optional().default(15),
})

export async function nobelGetCountryStats(
  client: NobelPrizeClient,
  args: z.infer<typeof nobelGetCountryStatsSchema>,
): Promise<string> {
  const countryMap = new Map<string, CountryStats>()

  const categoriesToFetch = args.category ? [args.category] : CATEGORY_CODES

  for (const cat of categoriesToFetch) {
    const prizes = await client.getAllPrizes(cat)

    for (const prize of prizes) {
      if (!prize.laureates) continue

      for (const laureate of prize.laureates) {
        if (!laureate.affiliations || laureate.affiliations.length === 0) continue

        for (const aff of laureate.affiliations) {
          const country = aff.country?.en
          if (!country) continue

          if (args.country && !country.toLowerCase().includes(args.country.toLowerCase())) {
            continue
          }

          let stats = countryMap.get(country)
          if (!stats) {
            stats = { country, total: 0, byCategory: {} }
            countryMap.set(country, stats)
          }
          stats.total++
          stats.byCategory[cat] = (stats.byCategory[cat] ?? 0) + 1
        }
      }
    }
  }

  const sorted = [...countryMap.values()].sort((a, b) => b.total - a.total).slice(0, args.limit)

  if (sorted.length === 0) {
    return args.country
      ? `No Nobel Prize data found for "${args.country}".`
      : 'No country statistics available.'
  }

  if (args.country && sorted.length === 1) {
    const s = sorted[0]
    const lines = [`Nobel Prize Statistics — ${s.country}`, '', `Total laureates: ${s.total}`, '']

    for (const code of CATEGORY_CODES) {
      const count = s.byCategory[code] ?? 0
      if (count > 0) {
        lines.push(`  ${CATEGORY_MAP[code]}: ${count}`)
      }
    }

    return lines.join('\n')
  }

  return NobelFormatter.formatCountryRanking(sorted)
}
