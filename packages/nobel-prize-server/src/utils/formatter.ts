import type { Laureate, NobelPrize, CategoryStats, CountryStats, TrendData } from '../api/types.js'
import { CATEGORY_MAP, SPARKLINE_CHARS } from './constants.js'

function text(localized?: { en?: string } | null, fallback = 'N/A'): string {
  return localized?.en ?? fallback
}

function portionFraction(portion: string): string {
  switch (portion) {
    case '1':
      return 'sole recipient'
    case '1/2':
      return '1/2'
    case '1/3':
      return '1/3'
    case '1/4':
      return '1/4'
    default:
      return portion
  }
}

export class NobelFormatter {
  static formatLaureate(laureate: Laureate): string {
    const name =
      text(laureate.knownName) !== 'N/A' ? text(laureate.knownName) : text(laureate.fullName)
    const born = laureate.birth?.date ?? ''
    const died = laureate.death?.date ?? ''
    const lifespan = born
      ? `(${born.slice(0, 4)}${died ? '–' + died.slice(0, 4) : '–present'})`
      : ''

    const lines: string[] = []
    lines.push(`🏆 ${name} ${lifespan}`)

    if (laureate.gender && laureate.gender !== 'org') {
      const birthPlace = laureate.birth?.place
      if (birthPlace) {
        const parts = [text(birthPlace.city, ''), text(birthPlace.country, '')].filter(Boolean)
        if (parts.length > 0) {
          lines.push(`   Born: ${born || 'Unknown'}, ${parts.join(', ')}`)
        }
      }
      if (died) {
        const deathPlace = laureate.death?.place
        const parts = [text(deathPlace?.city, ''), text(deathPlace?.country, '')].filter(Boolean)
        lines.push(`   Died: ${died}${parts.length > 0 ? ', ' + parts.join(', ') : ''}`)
      }
    }

    if (laureate.nobelPrizes && laureate.nobelPrizes.length > 0) {
      lines.push('')
      for (const prize of laureate.nobelPrizes) {
        const catName =
          text(prize.categoryFullName) !== 'N/A'
            ? text(prize.categoryFullName)
            : text(prize.category)
        lines.push(`   Nobel Prize in ${catName}, ${prize.awardYear}`)
        if (prize.motivation) {
          lines.push(`   Motivation: "${text(prize.motivation)}"`)
        }
        lines.push(`   Share: ${portionFraction(prize.portion)}`)

        if (prize.affiliations && prize.affiliations.length > 0) {
          for (const aff of prize.affiliations) {
            const affParts = [text(aff.name, ''), text(aff.city, ''), text(aff.country, '')].filter(
              Boolean,
            )
            if (affParts.length > 0) {
              lines.push(`   Affiliation: ${affParts.join(', ')}`)
            }
          }
        }
        lines.push('')
      }
    }

    return lines.join('\n').trimEnd()
  }

  static formatLaureateList(laureates: Laureate[], total: number): string {
    const lines: string[] = [`Found ${total} laureate(s)`, '']

    for (const l of laureates) {
      const name = text(l.knownName) !== 'N/A' ? text(l.knownName) : text(l.fullName)
      const prizes =
        l.nobelPrizes?.map((p) => `${text(p.category)} ${p.awardYear}`).join(', ') ?? ''
      lines.push(`• ${name} (ID: ${l.id}) — ${prizes}`)
    }

    return lines.join('\n')
  }

  static formatPrize(prize: NobelPrize): string {
    const lines: string[] = []
    const catName =
      text(prize.categoryFullName) !== 'N/A' ? text(prize.categoryFullName) : text(prize.category)
    lines.push(`${prize.awardYear} — ${catName}`)

    if (prize.laureates && prize.laureates.length > 0) {
      const laureateNames = prize.laureates
        .map((l) => `${text(l.knownName) || text(l.fullName)} (${portionFraction(l.portion)})`)
        .join(', ')
      lines.push(`  🏆 ${laureateNames}`)

      const motivation = prize.laureates[0]?.motivation
      if (motivation) {
        lines.push(`  "${text(motivation)}"`)
      }
    } else if (prize.topMotivation) {
      lines.push(`  "${text(prize.topMotivation)}"`)
    } else {
      lines.push('  No laureates awarded')
    }

    return lines.join('\n')
  }

  static formatPrizeList(prizes: NobelPrize[], total?: number): string {
    const header = total !== undefined ? `Nobel Prizes (${total} total)\n` : ''
    return header + prizes.map((p) => NobelFormatter.formatPrize(p)).join('\n\n')
  }

  static formatCategories(categories: CategoryStats[]): string {
    const lines: string[] = ['Nobel Prize Categories', '']
    lines.push('Category              Code    First  Total   Laureates  Orgs')
    lines.push('━'.repeat(62))

    let totalPrizes = 0
    let totalLaureates = 0
    let totalOrgs = 0

    for (const cat of categories) {
      totalPrizes += cat.totalPrizes
      totalLaureates += cat.totalLaureates
      totalOrgs += cat.totalOrganizations
      lines.push(
        `${cat.name.padEnd(22)}${cat.code.padEnd(8)}${String(cat.firstAward).padEnd(7)}${String(cat.totalPrizes).padEnd(8)}${String(cat.totalLaureates).padEnd(11)}${cat.totalOrganizations}`,
      )
    }

    lines.push('━'.repeat(62))
    lines.push(
      `${''.padEnd(22)}${'Total'.padEnd(8)}${''.padEnd(7)}${String(totalPrizes).padEnd(8)}${String(totalLaureates).padEnd(11)}${totalOrgs}`,
    )

    return lines.join('\n')
  }

  static formatCountryRanking(stats: CountryStats[]): string {
    const lines: string[] = ['Nobel Prizes by Country', '']
    lines.push('Rank  Country              Total   Phy  Che  Med  Lit  Pea  Eco')
    lines.push('━'.repeat(65))

    stats.forEach((s, i) => {
      const phy = String(s.byCategory['phy'] ?? 0).padEnd(5)
      const che = String(s.byCategory['che'] ?? 0).padEnd(5)
      const med = String(s.byCategory['med'] ?? 0).padEnd(5)
      const lit = String(s.byCategory['lit'] ?? 0).padEnd(5)
      const pea = String(s.byCategory['pea'] ?? 0).padEnd(5)
      const eco = String(s.byCategory['eco'] ?? 0)
      lines.push(
        `${String(i + 1).padStart(4)}  ${s.country.padEnd(21)}${String(s.total).padEnd(8)}${phy}${che}${med}${lit}${pea}${eco}`,
      )
    })

    return lines.join('\n')
  }

  static formatTrend(data: TrendData): string {
    const lines: string[] = []
    const title = data.category
      ? `${data.metric} Trends — ${CATEGORY_MAP[data.category] ?? data.category}`
      : `${data.metric} Trends — All Categories`
    lines.push(title, '')

    for (const decade of data.decades) {
      const entries = Object.entries(decade.values)
        .map(([k, v]) => `${k}: ${v}`)
        .join('  ')
      lines.push(`${decade.label}  ${entries}`)
    }

    if (data.summary) {
      lines.push('', data.summary)
    }

    return lines.join('\n')
  }

  static sparkline(values: number[]): string {
    if (values.length === 0) return ''
    const max = Math.max(...values)
    if (max === 0) return SPARKLINE_CHARS[0].repeat(values.length)
    return values
      .map((v) => {
        const idx = Math.round((v / max) * (SPARKLINE_CHARS.length - 1))
        return SPARKLINE_CHARS[idx]
      })
      .join('')
  }
}
