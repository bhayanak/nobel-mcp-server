export const CATEGORY_MAP: Record<string, string> = {
  phy: 'Physics',
  che: 'Chemistry',
  med: 'Physiology or Medicine',
  lit: 'Literature',
  pea: 'Peace',
  eco: 'Economic Sciences',
}

export const CATEGORY_CODES = Object.keys(CATEGORY_MAP) as Array<keyof typeof CATEGORY_MAP>

export const CATEGORY_API_MAP: Record<string, string> = {
  phy: 'phy',
  che: 'che',
  med: 'med',
  lit: 'lit',
  pea: 'pea',
  eco: 'eco',
}

export const SPARKLINE_CHARS = ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█']

export const CURRENT_YEAR = new Date().getFullYear()
