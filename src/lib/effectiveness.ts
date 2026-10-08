import type { DamageRelations } from '../types/pokeapi'

/** The 18 battle types, in Pokédex order. PokéAPI also lists "unknown", "shadow" and "stellar", which have no chart. */
export const POKEMON_TYPES = [
  'normal',
  'fire',
  'water',
  'electric',
  'grass',
  'ice',
  'fighting',
  'poison',
  'ground',
  'flying',
  'psychic',
  'bug',
  'rock',
  'ghost',
  'dragon',
  'dark',
  'steel',
  'fairy',
] as const

export type PokemonTypeName = (typeof POKEMON_TYPES)[number]

export interface Matchup {
  type: PokemonTypeName
  multiplier: number
}

export interface TypeMatchups {
  /** Attacking types that deal more than 1× damage, strongest first. */
  weaknesses: Matchup[]
  /** Attacking types that deal less than 1× (but some) damage, most resisted first. */
  resistances: Matchup[]
  /** Attacking types that deal no damage at all. */
  immunities: PokemonTypeName[]
  /** Defending types that this Pokémon's own types hit for double damage. */
  strengths: PokemonTypeName[]
}

const includes = (list: { name: string }[], name: string): boolean =>
  list.some((entry) => entry.name === name)

/** Damage multiplier an attack of `attacking` type deals to a defender of exactly one type. */
export function defensiveMultiplier(relations: DamageRelations, attacking: string): number {
  if (includes(relations.no_damage_from, attacking)) return 0
  if (includes(relations.double_damage_from, attacking)) return 2
  if (includes(relations.half_damage_from, attacking)) return 0.5
  return 1
}

/** Combine the relations of every type a Pokémon has (one or two) into a full matchup chart. */
export function computeMatchups(relations: DamageRelations[]): TypeMatchups {
  const weaknesses: Matchup[] = []
  const resistances: Matchup[] = []
  const immunities: PokemonTypeName[] = []

  for (const type of POKEMON_TYPES) {
    const multiplier = relations.reduce(
      (total, relation) => total * defensiveMultiplier(relation, type),
      1,
    )
    if (multiplier === 0) immunities.push(type)
    else if (multiplier > 1) weaknesses.push({ type, multiplier })
    else if (multiplier < 1) resistances.push({ type, multiplier })
  }

  weaknesses.sort((a, b) => b.multiplier - a.multiplier)
  resistances.sort((a, b) => a.multiplier - b.multiplier)

  const strengths = POKEMON_TYPES.filter((type) =>
    relations.some((relation) => includes(relation.double_damage_to, type)),
  )

  return { weaknesses, resistances, immunities, strengths }
}

/** 2 → "2×", 0.5 → "0.5×", 0.25 → "0.25×" */
export function formatMultiplier(multiplier: number): string {
  const text = Number.isInteger(multiplier)
    ? String(multiplier)
    : multiplier.toFixed(2).replace(/0+$/, '')
  return `${text}×`
}
