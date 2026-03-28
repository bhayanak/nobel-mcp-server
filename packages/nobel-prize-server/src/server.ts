import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import type { NobelPrizeClient } from './api/client.js'
import {
  nobelGetLaureateSchema,
  nobelSearchLaureatesSchema,
  nobelGetLaureate,
  nobelSearchLaureates,
} from './tools/laureates.js'
import {
  nobelGetPrizesSchema,
  nobelGetPrizeByYearSchema,
  nobelGetPrizes,
  nobelGetPrizeByYear,
} from './tools/prizes.js'
import {
  nobelListCategoriesSchema,
  nobelGetCategoryStatsSchema,
  nobelListCategories,
  nobelGetCategoryStats,
} from './tools/categories.js'
import { nobelGetCountryStatsSchema, nobelGetCountryStats } from './tools/countries.js'
import { nobelGetTrendsSchema, nobelGetTrends } from './tools/trends.js'

export function createServer(client: NobelPrizeClient): McpServer {
  const server = new McpServer({
    name: 'nobel-prize-mcp-server',
    version: '0.1.0',
  })

  server.tool(
    'nobel_get_laureate',
    'Get detailed information about a Nobel laureate by name or ID, including biography, prizes, motivation, and affiliations.',
    nobelGetLaureateSchema.shape,
    async (args) => {
      const result = await nobelGetLaureate(client, args)
      return { content: [{ type: 'text' as const, text: result }] }
    },
  )

  server.tool(
    'nobel_search_laureates',
    'Search Nobel laureates by name, gender, birth country, category, or year range.',
    nobelSearchLaureatesSchema.shape,
    async (args) => {
      const result = await nobelSearchLaureates(client, args)
      return { content: [{ type: 'text' as const, text: result }] }
    },
  )

  server.tool(
    'nobel_get_prizes',
    'Search Nobel Prizes by category, year, or year range.',
    nobelGetPrizesSchema.shape,
    async (args) => {
      const result = await nobelGetPrizes(client, args)
      return { content: [{ type: 'text' as const, text: result }] }
    },
  )

  server.tool(
    'nobel_get_prize_by_year',
    'Get all Nobel Prizes awarded in a specific year.',
    nobelGetPrizeByYearSchema.shape,
    async (args) => {
      const result = await nobelGetPrizeByYear(client, args)
      return { content: [{ type: 'text' as const, text: result }] }
    },
  )

  server.tool(
    'nobel_list_categories',
    'List all Nobel Prize categories with statistics (total prizes, laureates, etc.).',
    nobelListCategoriesSchema.shape,
    async () => {
      const result = await nobelListCategories(client)
      return { content: [{ type: 'text' as const, text: result }] }
    },
  )

  server.tool(
    'nobel_get_category_stats',
    'Get detailed statistics for a specific Nobel Prize category including decade breakdown.',
    nobelGetCategoryStatsSchema.shape,
    async (args) => {
      const result = await nobelGetCategoryStats(client, args)
      return { content: [{ type: 'text' as const, text: result }] }
    },
  )

  server.tool(
    'nobel_get_country_stats',
    'Get Nobel Prize statistics by country — top rankings or details for a specific country.',
    nobelGetCountryStatsSchema.shape,
    async (args) => {
      const result = await nobelGetCountryStats(client, args)
      return { content: [{ type: 'text' as const, text: result }] }
    },
  )

  server.tool(
    'nobel_get_trends',
    'Analyze historical trends in Nobel Prizes: age, gender, shared prizes, or country distribution over decades.',
    nobelGetTrendsSchema.shape,
    async (args) => {
      const result = await nobelGetTrends(client, args)
      return { content: [{ type: 'text' as const, text: result }] }
    },
  )

  return server
}
