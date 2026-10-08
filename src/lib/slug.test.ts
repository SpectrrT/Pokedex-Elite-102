import { describe, expect, it } from 'vitest'
import { toSlug } from './slug'

describe('toSlug', () => {
  it.each([
    ['Pikachu', 'pikachu'],
    ['  pikachu  ', 'pikachu'],
    ['Mr. Mime', 'mr-mime'],
    ['Mime Jr.', 'mime-jr'],
    ["Farfetch'd", 'farfetchd'],
    ['Farfetch’d', 'farfetchd'],
    ['Flabébé', 'flabebe'],
    ['Nidoran♀', 'nidoran-f'],
    ['Nidoran♂', 'nidoran-m'],
    ['Type: Null', 'type-null'],
    ['Ho-Oh', 'ho-oh'],
    ['Porygon-Z', 'porygon-z'],
    ['Tapu Koko', 'tapu-koko'],
    ['Zygarde 10%', 'zygarde-10'],
    ['great___tusk', 'great-tusk'],
  ])('turns %j into %j', (input, expected) => {
    expect(toSlug(input)).toBe(expected)
  })

  it('normalises National Dex numbers', () => {
    expect(toSlug('25')).toBe('25')
    expect(toSlug('#025')).toBe('25')
    expect(toSlug(' 0001 ')).toBe('1')
  })

  it('returns an empty string when nothing usable was typed', () => {
    expect(toSlug('')).toBe('')
    expect(toSlug('   ')).toBe('')
    expect(toSlug('!!!')).toBe('')
  })
})
