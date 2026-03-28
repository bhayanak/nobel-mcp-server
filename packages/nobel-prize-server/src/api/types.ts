export interface LocalizedText {
  en: string
  se?: string
  no?: string
}

export interface BirthDeath {
  date: string
  place?: {
    city?: LocalizedText
    country?: LocalizedText
    cityNow?: LocalizedText
    countryNow?: LocalizedText
    continent?: LocalizedText
  }
}

export interface Affiliation {
  name?: LocalizedText
  nameNow?: LocalizedText
  city?: LocalizedText
  country?: LocalizedText
}

export interface NobelPrizeRef {
  awardYear: string
  category: LocalizedText
  categoryFullName: LocalizedText
  sortOrder: string
  portion: string
  dateAwarded?: string
  prizeStatus: string
  motivation: LocalizedText
  prizeAmount: number
  prizeAmountAdjusted: number
  affiliations?: Affiliation[]
  links?: { rel: string; href: string; action: string; types: string }[]
}

export interface Laureate {
  id: string
  knownName?: LocalizedText
  givenName?: LocalizedText
  familyName?: LocalizedText
  fullName?: LocalizedText
  gender?: string
  birth?: BirthDeath
  death?: BirthDeath
  nobelPrizes?: NobelPrizeRef[]
  wikipedia?: { english?: string }
  wikidata?: { id?: string }
  orgName?: LocalizedText
  founded?: BirthDeath
}

export interface PrizeLaureate {
  id: string
  knownName?: LocalizedText
  fullName?: LocalizedText
  portion: string
  sortOrder: string
  motivation: LocalizedText
  affiliations?: Affiliation[]
}

export interface NobelPrize {
  awardYear: string
  category: LocalizedText
  categoryFullName: LocalizedText
  dateAwarded?: string
  prizeAmount: number
  prizeAmountAdjusted: number
  laureates?: PrizeLaureate[]
  topMotivation?: LocalizedText
}

export interface LaureateQuery {
  name?: string
  gender?: string
  birthCountry?: string
  nobelPrizeCategory?: string
  nobelPrizeYear?: string
  yearTo?: string
  limit?: number
  offset?: number
}

export interface PrizeQuery {
  category?: string
  year?: number
  yearFrom?: number
  yearTo?: number
  limit?: number
  offset?: number
}

export interface CategoryStats {
  code: string
  name: string
  firstAward: number
  totalPrizes: number
  totalLaureates: number
  totalOrganizations: number
}

export interface CountryStats {
  country: string
  total: number
  byCategory: Record<string, number>
}

export interface TrendData {
  metric: string
  category?: string
  decades: TrendDecade[]
  summary: string
}

export interface TrendDecade {
  label: string
  values: Record<string, number>
}

export interface NobelConfig {
  baseUrl: string
  cacheTtlMs: number
  cacheMaxSize: number
  timeoutMs: number
  language: string
  perPage: number
}

export interface LaureatesApiResponse {
  laureates: Laureate[]
  meta?: { offset: number; limit: number; count: number }
}

export interface PrizesApiResponse {
  nobelPrizes: NobelPrize[]
  meta?: { offset: number; limit: number; count: number }
}
