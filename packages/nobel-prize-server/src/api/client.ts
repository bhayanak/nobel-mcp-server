import type {
  NobelConfig,
  Laureate,
  LaureateQuery,
  NobelPrize,
  PrizeQuery,
  LaureatesApiResponse,
  PrizesApiResponse,
} from './types.js'
import { LRUCache } from './cache.js'

const ALLOWED_BASE_URL = 'https://api.nobelprize.org'

export class NobelPrizeClient {
  private config: NobelConfig
  private cache: LRUCache<unknown>

  constructor(config: NobelConfig) {
    if (!config.baseUrl.startsWith(ALLOWED_BASE_URL)) {
      throw new Error(`Base URL must start with ${ALLOWED_BASE_URL}`)
    }
    this.config = config
    this.cache = new LRUCache(config.cacheMaxSize, config.cacheTtlMs)
  }

  private async fetchJson<T>(path: string, params?: Record<string, string>): Promise<T> {
    const url = new URL(path, this.config.baseUrl)
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== '') {
          url.searchParams.set(key, value)
        }
      }
    }

    const cacheKey = url.toString()
    const cached = this.cache.get(cacheKey) as T | undefined
    if (cached) return cached

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeoutMs)

    try {
      const response = await fetch(url.toString(), {
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      })

      if (!response.ok) {
        throw new Error(`Nobel API request failed: ${response.status} ${response.statusText}`)
      }

      const data = (await response.json()) as T
      this.cache.set(cacheKey, data)
      return data
    } finally {
      clearTimeout(timeoutId)
    }
  }

  async getLaureate(id: number): Promise<Laureate> {
    const data = await this.fetchJson<LaureatesApiResponse>(`/2.1/laureate/${id}`)
    if (!data.laureates || data.laureates.length === 0) {
      throw new Error(`Laureate with ID ${id} not found`)
    }
    return data.laureates[0]
  }

  async searchLaureates(params: LaureateQuery): Promise<{ laureates: Laureate[]; total: number }> {
    const queryParams: Record<string, string> = {}

    if (params.name) queryParams.name = params.name
    if (params.gender) queryParams.gender = params.gender
    if (params.birthCountry) queryParams.birthCountry = params.birthCountry
    if (params.nobelPrizeCategory) queryParams.nobelPrizeCategory = params.nobelPrizeCategory
    if (params.nobelPrizeYear) queryParams.nobelPrizeYear = params.nobelPrizeYear
    if (params.yearTo) queryParams.yearTo = params.yearTo
    if (params.limit) queryParams.limit = String(params.limit)
    if (params.offset) queryParams.offset = String(params.offset)

    const data = await this.fetchJson<LaureatesApiResponse>('/2.1/laureates', queryParams)
    return {
      laureates: data.laureates || [],
      total: data.meta?.count ?? data.laureates?.length ?? 0,
    }
  }

  async getPrizes(params: PrizeQuery): Promise<{ prizes: NobelPrize[]; total: number }> {
    const queryParams: Record<string, string> = {}

    if (params.category) queryParams.nobelPrizeCategory = params.category
    if (params.year) queryParams.nobelPrizeYear = String(params.year)
    if (params.yearFrom) queryParams.yearTo = String(params.yearFrom)
    if (params.yearTo) queryParams.yearTo = String(params.yearTo)
    if (params.limit) queryParams.limit = String(params.limit)
    if (params.offset) queryParams.offset = String(params.offset)

    const data = await this.fetchJson<PrizesApiResponse>('/2.1/nobelPrizes', queryParams)
    return {
      prizes: data.nobelPrizes || [],
      total: data.meta?.count ?? data.nobelPrizes?.length ?? 0,
    }
  }

  async getPrizesByYear(year: number): Promise<NobelPrize[]> {
    const data = await this.fetchJson<PrizesApiResponse>('/2.1/nobelPrizes', {
      nobelPrizeYear: String(year),
      limit: '20',
    })
    return data.nobelPrizes || []
  }

  async getAllLaureates(params?: LaureateQuery): Promise<Laureate[]> {
    const allLaureates: Laureate[] = []
    let offset = 0
    const limit = 100

    for (;;) {
      const queryParams: Record<string, string> = {
        limit: String(limit),
        offset: String(offset),
      }

      if (params?.nobelPrizeCategory) queryParams.nobelPrizeCategory = params.nobelPrizeCategory
      if (params?.gender) queryParams.gender = params.gender
      if (params?.birthCountry) queryParams.birthCountry = params.birthCountry

      const data = await this.fetchJson<LaureatesApiResponse>('/2.1/laureates', queryParams)
      const laureates = data.laureates || []
      allLaureates.push(...laureates)

      if (laureates.length < limit) break
      offset += limit
    }

    return allLaureates
  }

  async getAllPrizes(category?: string): Promise<NobelPrize[]> {
    const allPrizes: NobelPrize[] = []
    let offset = 0
    const limit = 100

    for (;;) {
      const queryParams: Record<string, string> = {
        limit: String(limit),
        offset: String(offset),
      }

      if (category) queryParams.nobelPrizeCategory = category

      const data = await this.fetchJson<PrizesApiResponse>('/2.1/nobelPrizes', queryParams)
      const prizes = data.nobelPrizes || []
      allPrizes.push(...prizes)

      if (prizes.length < limit) break
      offset += limit
    }

    return allPrizes
  }
}
