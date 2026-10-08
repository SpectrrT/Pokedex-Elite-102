import { describe, expect, it } from 'vitest'
import typeElectric from '../test/fixtures/type-electric.json'
import typeFire from '../test/fixtures/type-fire.json'
import typeFlying from '../test/fixtures/type-flying.json'
import {
  POKEMON_TYPES,
  computeMatchups,
  defensiveMultiplier,
  formatMultiplier,
} from './effectiveness'

describe('defensiveMultiplier', () => {
  it('reads a single type chart', () => {
    expect(defensiveMultiplier(typeElectric.damage_relations, 'ground')).toBe(2)
    expect(defensiveMultiplier(typeElectric.damage_relations, 'flying')).toBe(0.5)
    expect(defensiveMultiplier(typeElectric.damage_relations, 'fire')).toBe(1)
    expect(defensiveMultiplier(typeFlying.damage_relations, 'ground')).toBe(0)
  })
})

describe('computeMatchups', () => {
  it('covers every battle type exactly once', () => {
    const { weaknesses, resistances, immunities } = computeMatchups([typeElectric.damage_relations])
    const neutral =
      POKEMON_TYPES.length - weaknesses.length - resistances.length - immunities.length
    expect(neutral).toBe(14)
    expect(weaknesses).toEqual([{ type: 'ground', multiplier: 2 }])
    expect(resistances.map((m) => m.type).sort()).toEqual(['electric', 'flying', 'steel'])
    expect(immunities).toEqual([])
  })

  it('multiplies both charts for a dual-type Pokémon (Charizard: Fire/Flying)', () => {
    const matchups = computeMatchups([typeFire.damage_relations, typeFlying.damage_relations])

    expect(matchups.weaknesses).toEqual([
      { type: 'rock', multiplier: 4 },
      { type: 'water', multiplier: 2 },
      { type: 'electric', multiplier: 2 },
    ])
    expect(matchups.immunities).toEqual(['ground'])

    const resisted = Object.fromEntries(matchups.resistances.map((m) => [m.type, m.multiplier]))
    expect(resisted).toEqual({
      grass: 0.25,
      bug: 0.25,
      fire: 0.5,
      fighting: 0.5,
      steel: 0.5,
      fairy: 0.5,
    })
    // Fire resists Ice and Flying is weak to it, so Charizard takes neutral damage.
    expect(matchups.weaknesses.some((m) => m.type === 'ice')).toBe(false)
    expect(matchups.resistances.some((m) => m.type === 'ice')).toBe(false)

    expect(matchups.strengths).toEqual(['grass', 'ice', 'fighting', 'bug', 'steel'])
  })

  it('orders weaknesses strongest first and resistances most-resisted first', () => {
    const { weaknesses, resistances } = computeMatchups([
      typeFire.damage_relations,
      typeFlying.damage_relations,
    ])
    expect(weaknesses[0]?.multiplier).toBe(4)
    expect(resistances[0]?.multiplier).toBe(0.25)
    expect(resistances.at(-1)?.multiplier).toBe(0.5)
  })
})

describe('formatMultiplier', () => {
  it('prints tidy multipliers', () => {
    expect(formatMultiplier(4)).toBe('4×')
    expect(formatMultiplier(2)).toBe('2×')
    expect(formatMultiplier(0.5)).toBe('0.5×')
    expect(formatMultiplier(0.25)).toBe('0.25×')
  })
})
