import { z } from 'zod'
import type { NobelPrizeClient } from '../api/client.js'
import { NobelFormatter } from '../utils/formatter.js'
import { CATEGORY_MAP, CATEGORY_CODES } from '../utils/constants.js'
import type { CategoryStats } from '../api/types.js'

export const nobelListCategoriesSchema = z.object({})

export const nobelGetCategoryStatsSchema = z.object({
  category: z.enum(['phy', 'che', 'med', 'lit', 'pea', 'eco']).describe('Category code'),
})

export async function nobelListCategories(client: NobelPrizeClient): Promise<string> {
  const categories: CategoryStats[] = []

  for (const code of CATEGORY_CODES) {
    const result = await client.getPrizes({ category: code, limit: 1 })
    const total = result.total

    const allPrizes = await client.getAllPrizes(code)
    let totalLaureates = 0
    const totalOrgs = 0

    for (const prize of allPrizes) {
      if (prize.laureates) {
        totalLaureates += prize.laureates.length
      }
    }

    categories.push({
      code,
      name: CATEGORY_MAP[code] ?? code,
      firstAward: code === 'eco' ? 1969 : 1901,
      totalPrizes: total || allPrizes.length,
      totalLaureates,
      totalOrganizations: totalOrgs,
    })
  }

  return NobelFormatter.formatCategories(categories)
}

export async function nobelGetCategoryStats(
  client: NobelPrizeClient,
  args: z.infer<typeof nobelGetCategoryStatsSchema>,
): Promise<string> {
  const { category } = args
  const catName = CATEGORY_MAP[category] ?? category

  const allPrizes = await client.getAllPrizes(category)

  let totalLaureates = 0
  let sharedCount = 0
  const decades = new Map<string, number>()

  for (const prize of allPrizes) {
    const decade = `${Math.floor(parseInt(prize.awardYear) / 10) * 10}s`
    decades.set(decade, (decades.get(decade) ?? 0) + 1)

    if (prize.laureates) {
      const hasMultiple = prize.laureates.length > 1
      if (hasMultiple) sharedCount++
      totalLaureates += prize.laureates.length
    }
  }

  const lines: string[] = [
    `📊 ${catName} — Detailed Statistics`,
    '',
    `Total prizes awarded: ${allPrizes.length}`,
    `Total laureates: ${totalLaureates}`,
    `Shared prizes: ${sharedCount}`,
    `First awarded: ${category === 'eco' ? '1969' : '1901'}`,
    '',
    'Prizes by Decade:',
  ]

  const sortedDecades = [...decades.entries()].sort(([a], [b]) => a.localeCompare(b))
  for (const [decade, count] of sortedDecades) {
    lines.push(`  ${decade}: ${count}`)
  }

  const values = sortedDecades.map(([, v]) => v)
  lines.push('', `Trend: ${NobelFormatter.sparkline(values)}`)

  return lines.join('\n')
}
