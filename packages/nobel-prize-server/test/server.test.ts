import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js'
import { NobelPrizeClient } from '../src/api/client.js'
import { loadConfig } from '../src/config.js'
import { createServer } from '../src/server.js'
import einsteinFixture from './fixtures/laureate-einstein.json'
import prizes2023Fixture from './fixtures/prizes-2023.json'

function mockFetchForAllCalls() {
  return vi.spyOn(globalThis, 'fetch').mockImplementation(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(einsteinFixture),
    } as Response),
  )
}

describe('MCP Server Integration', () => {
  let mcpClient: Client
  let apiClient: NobelPrizeClient

  beforeEach(async () => {
    vi.restoreAllMocks()

    const config = loadConfig()
    apiClient = new NobelPrizeClient(config)
    const server = createServer(apiClient)

    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair()

    mcpClient = new Client({ name: 'test-client', version: '1.0.0' })

    await Promise.all([mcpClient.connect(clientTransport), server.connect(serverTransport)])
  })

  it('should create server with all tools registered', async () => {
    const tools = await mcpClient.listTools()
    const toolNames = tools.tools.map((t) => t.name)

    expect(toolNames).toContain('nobel_get_laureate')
    expect(toolNames).toContain('nobel_search_laureates')
    expect(toolNames).toContain('nobel_get_prizes')
    expect(toolNames).toContain('nobel_get_prize_by_year')
    expect(toolNames).toContain('nobel_list_categories')
    expect(toolNames).toContain('nobel_get_category_stats')
    expect(toolNames).toContain('nobel_get_country_stats')
    expect(toolNames).toContain('nobel_get_trends')
    expect(toolNames).toHaveLength(8)
  })

  it('should call nobel_get_laureate tool', async () => {
    mockFetchForAllCalls()

    const result = await mcpClient.callTool({
      name: 'nobel_get_laureate',
      arguments: { nameOrId: 26 },
    })

    const text = (result.content as Array<{ type: string; text: string }>)[0].text
    expect(text).toContain('Albert Einstein')
  })

  it('should call nobel_search_laureates tool', async () => {
    mockFetchForAllCalls()

    const result = await mcpClient.callTool({
      name: 'nobel_search_laureates',
      arguments: { name: 'Einstein' },
    })

    const text = (result.content as Array<{ type: string; text: string }>)[0].text
    expect(text).toContain('Albert Einstein')
  })

  it('should call nobel_get_prizes tool', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(prizes2023Fixture),
    } as Response)

    const result = await mcpClient.callTool({
      name: 'nobel_get_prizes',
      arguments: { year: 2023 },
    })

    const text = (result.content as Array<{ type: string; text: string }>)[0].text
    expect(text).toContain('2023')
  })

  it('should call nobel_get_prize_by_year tool', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(prizes2023Fixture),
    } as Response)

    const result = await mcpClient.callTool({
      name: 'nobel_get_prize_by_year',
      arguments: { year: 2023 },
    })

    const text = (result.content as Array<{ type: string; text: string }>)[0].text
    expect(text).toContain('Nobel Prizes in 2023')
  })

  it('should call nobel_list_categories tool', async () => {
    // Each category needs getPrizes (limit 1) + getAllPrizes (paginated)
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    // Return minimal data for every call
    fetchSpy.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            nobelPrizes: [],
            meta: { offset: 0, limit: 100, count: 0 },
          }),
      } as Response),
    )

    const result = await mcpClient.callTool({
      name: 'nobel_list_categories',
      arguments: {},
    })

    const text = (result.content as Array<{ type: string; text: string }>)[0].text
    expect(text).toContain('Nobel Prize Categories')
  })

  it('should call nobel_get_category_stats tool', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          nobelPrizes: [],
          meta: { offset: 0, limit: 100, count: 0 },
        }),
    } as Response)

    const result = await mcpClient.callTool({
      name: 'nobel_get_category_stats',
      arguments: { category: 'phy' },
    })

    const text = (result.content as Array<{ type: string; text: string }>)[0].text
    expect(text).toContain('Physics')
  })

  it('should call nobel_get_country_stats tool', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          nobelPrizes: [],
          meta: { offset: 0, limit: 100, count: 0 },
        }),
    } as Response)

    const result = await mcpClient.callTool({
      name: 'nobel_get_country_stats',
      arguments: { category: 'phy' },
    })

    const text = (result.content as Array<{ type: string; text: string }>)[0].text
    expect(text).toContain('No country statistics available')
  })

  it('should call nobel_get_trends tool', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          nobelPrizes: [],
          meta: { offset: 0, limit: 100, count: 0 },
        }),
    } as Response)

    const result = await mcpClient.callTool({
      name: 'nobel_get_trends',
      arguments: { metric: 'shared' },
    })

    const text = (result.content as Array<{ type: string; text: string }>)[0].text
    expect(text).toContain('Shared vs Sole Prizes')
  })
})
