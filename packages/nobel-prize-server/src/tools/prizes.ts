import { z } from 'zod'
import type { NobelPrizeClient } from '../api/client.js'
import { NobelFormatter } from '../utils/formatter.js'
import { CURRENT_YEAR } from '../utils/constants.js'

export const nobelGetPrizesSchema = z.object({
  category: z.enum(['phy', 'che', 'med', 'lit', 'pea', 'eco']).optional(),
  year: z.number().min(1901).max(CURRENT_YEAR).optional(),
  yearFrom: z.number().min(1901).max(CURRENT_YEAR).optional(),
  yearTo: z.number().min(1901).max(CURRENT_YEAR).optional(),
  limit: z.number().min(1).max(100).optional().default(10),
})

export const nobelGetPrizeByYearSchema = z.object({
  year: z.number().min(1901).max(CURRENT_YEAR).describe('Prize year (1901–present)'),
})

export async function nobelGetPrizes(
  client: NobelPrizeClient,
  args: z.infer<typeof nobelGetPrizesSchema>,
): Promise<string> {
  const result = await client.getPrizes({
    category: args.category,
    year: args.year,
    yearFrom: args.yearFrom,
    yearTo: args.yearTo,
    limit: args.limit,
  })

  if (result.prizes.length === 0) {
    return 'No prizes found matching the given criteria.'
  }

  return NobelFormatter.formatPrizeList(result.prizes, result.total)
}

export async function nobelGetPrizeByYear(
  client: NobelPrizeClient,
  args: z.infer<typeof nobelGetPrizeByYearSchema>,
): Promise<string> {
  const prizes = await client.getPrizesByYear(args.year)

  if (prizes.length === 0) {
    return `No Nobel Prizes were awarded in ${args.year}.`
  }

  return `Nobel Prizes in ${args.year}\n\n${prizes.map((p) => NobelFormatter.formatPrize(p)).join('\n\n')}`
}
