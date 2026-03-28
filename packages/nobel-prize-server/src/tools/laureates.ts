import { z } from 'zod'
import type { NobelPrizeClient } from '../api/client.js'
import { NobelFormatter } from '../utils/formatter.js'
import { CURRENT_YEAR } from '../utils/constants.js'

export const nobelGetLaureateSchema = z.object({
  nameOrId: z
    .union([z.string(), z.number()])
    .describe('Laureate name (partial match) or Nobel ID number'),
})

export const nobelSearchLaureatesSchema = z.object({
  name: z.string().optional().describe('Search by name (partial match)'),
  gender: z.enum(['male', 'female', 'org']).optional(),
  birthCountry: z.string().optional().describe('Country of birth'),
  category: z.enum(['phy', 'che', 'med', 'lit', 'pea', 'eco']).optional(),
  yearFrom: z.number().min(1901).max(CURRENT_YEAR).optional().describe('Prize year from'),
  yearTo: z.number().min(1901).max(CURRENT_YEAR).optional().describe('Prize year to'),
  limit: z.number().min(1).max(100).optional().default(20),
})

export async function nobelGetLaureate(
  client: NobelPrizeClient,
  args: z.infer<typeof nobelGetLaureateSchema>,
): Promise<string> {
  const { nameOrId } = args

  // If it's a number, fetch by ID directly
  if (typeof nameOrId === 'number' || /^\d+$/.test(String(nameOrId))) {
    const id = typeof nameOrId === 'number' ? nameOrId : parseInt(String(nameOrId), 10)
    const laureate = await client.getLaureate(id)
    return NobelFormatter.formatLaureate(laureate)
  }

  // Otherwise search by name
  const result = await client.searchLaureates({ name: String(nameOrId), limit: 5 })
  if (result.laureates.length === 0) {
    return `No laureates found matching "${nameOrId}"`
  }

  if (result.laureates.length === 1) {
    return NobelFormatter.formatLaureate(result.laureates[0])
  }

  // Multiple results: show detailed first, list others
  const lines = [NobelFormatter.formatLaureate(result.laureates[0]), '']
  if (result.laureates.length > 1) {
    lines.push(`--- Also found ${result.laureates.length - 1} other match(es):`)
    for (const l of result.laureates.slice(1)) {
      const name = l.knownName?.en ?? l.fullName?.en ?? 'Unknown'
      const prizes = l.nobelPrizes?.map((p) => `${p.category?.en} ${p.awardYear}`).join(', ') ?? ''
      lines.push(`  • ${name} (ID: ${l.id}) — ${prizes}`)
    }
  }

  return lines.join('\n')
}

export async function nobelSearchLaureates(
  client: NobelPrizeClient,
  args: z.infer<typeof nobelSearchLaureatesSchema>,
): Promise<string> {
  const result = await client.searchLaureates({
    name: args.name,
    gender: args.gender,
    birthCountry: args.birthCountry,
    nobelPrizeCategory: args.category,
    nobelPrizeYear: args.yearFrom ? String(args.yearFrom) : undefined,
    yearTo: args.yearTo ? String(args.yearTo) : undefined,
    limit: args.limit,
  })

  if (result.laureates.length === 0) {
    return 'No laureates found matching the given criteria.'
  }

  return NobelFormatter.formatLaureateList(result.laureates, result.total)
}
