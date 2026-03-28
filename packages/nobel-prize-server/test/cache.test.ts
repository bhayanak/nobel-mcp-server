import { describe, it, expect, vi, beforeEach } from 'vitest'
import { LRUCache } from '../src/api/cache.js'

describe('LRUCache', () => {
  let cache: LRUCache<string>

  beforeEach(() => {
    cache = new LRUCache<string>(3, 60_000) // capacity 3, 1 min TTL
  })

  it('should store and retrieve values', () => {
    cache.set('a', 'alpha')
    expect(cache.get('a')).toBe('alpha')
  })

  it('should return undefined for missing keys', () => {
    expect(cache.get('missing')).toBeUndefined()
  })

  it('should evict oldest entry when at capacity', () => {
    cache.set('a', 'alpha')
    cache.set('b', 'beta')
    cache.set('c', 'charlie')
    cache.set('d', 'delta') // should evict 'a'

    expect(cache.get('a')).toBeUndefined()
    expect(cache.get('b')).toBe('beta')
    expect(cache.get('d')).toBe('delta')
    expect(cache.size).toBe(3)
  })

  it('should refresh access order on get', () => {
    cache.set('a', 'alpha')
    cache.set('b', 'beta')
    cache.set('c', 'charlie')

    // Access 'a' to make it recent
    cache.get('a')

    cache.set('d', 'delta') // should evict 'b' (oldest after refresh)

    expect(cache.get('a')).toBe('alpha')
    expect(cache.get('b')).toBeUndefined()
  })

  it('should expire entries after TTL', () => {
    vi.useFakeTimers()
    const shortCache = new LRUCache<string>(10, 100) // 100ms TTL

    shortCache.set('x', 'val')
    expect(shortCache.get('x')).toBe('val')

    vi.advanceTimersByTime(200)
    expect(shortCache.get('x')).toBeUndefined()

    vi.useRealTimers()
  })

  it('should clear all entries', () => {
    cache.set('a', 'alpha')
    cache.set('b', 'beta')
    cache.clear()
    expect(cache.size).toBe(0)
    expect(cache.get('a')).toBeUndefined()
  })
})
