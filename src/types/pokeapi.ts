/**
 * Typings for the subset of PokéAPI v2 (https://pokeapi.co/docs/v2) that this app consumes.
 * Only the fields the UI actually reads are declared; the real responses carry much more.
 */

export interface NamedApiResource {
  name: string
  url: string
}

export interface NamedApiResourceList {
  count: number
  next: string | null
  previous: string | null
  results: NamedApiResource[]
}

export interface PokemonSprites {
  front_default: string | null
  front_shiny: string | null
  other?: {
    'official-artwork'?: {
      front_default: string | null
      front_shiny: string | null
    }
  }
}

export interface PokemonType {
  slot: number
  type: NamedApiResource
}

export interface PokemonAbility {
  ability: NamedApiResource
  is_hidden: boolean
  slot: number
}

export interface PokemonStat {
  base_stat: number
  effort: number
  stat: NamedApiResource
}

/** A concrete Pokémon form, e.g. "pikachu" or "deoxys-attack". */
export interface Pokemon {
  id: number
  name: string
  /** Height in decimetres. */
  height: number
  /** Weight in hectograms. */
  weight: number
  base_experience: number | null
  is_default: boolean
  order: number
  species: NamedApiResource
  sprites: PokemonSprites
  types: PokemonType[]
  abilities: PokemonAbility[]
  stats: PokemonStat[]
  cries?: {
    latest: string | null
    legacy: string | null
  }
}

export interface FlavorText {
  flavor_text: string
  language: NamedApiResource
  version: NamedApiResource
}

export interface Genus {
  genus: string
  language: NamedApiResource
}

export interface PokemonSpeciesVariety {
  is_default: boolean
  pokemon: NamedApiResource
}

/** The species a Pokémon belongs to, e.g. "deoxys" (shared by every Deoxys form). */
export interface PokemonSpecies {
  id: number
  name: string
  is_legendary: boolean
  is_mythical: boolean
  is_baby: boolean
  capture_rate: number
  genera: Genus[]
  flavor_text_entries: FlavorText[]
  evolution_chain: { url: string }
  evolves_from_species: NamedApiResource | null
  varieties: PokemonSpeciesVariety[]
  color: NamedApiResource
  generation: NamedApiResource
  habitat: NamedApiResource | null
}

export interface EvolutionDetail {
  item: NamedApiResource | null
  trigger: NamedApiResource
  /** 1 = female, 2 = male. */
  gender: number | null
  held_item: NamedApiResource | null
  known_move: NamedApiResource | null
  known_move_type: NamedApiResource | null
  location: NamedApiResource | null
  min_level: number | null
  min_happiness: number | null
  min_beauty: number | null
  min_affection: number | null
  needs_overworld_rain: boolean
  party_species: NamedApiResource | null
  party_type: NamedApiResource | null
  /** 1 = Attack > Defense, 0 = equal, -1 = Attack < Defense. */
  relative_physical_stats: number | null
  time_of_day: string
  trade_species: NamedApiResource | null
  turn_upside_down: boolean
}

export interface ChainLink {
  is_baby: boolean
  species: NamedApiResource
  evolution_details: EvolutionDetail[]
  evolves_to: ChainLink[]
}

export interface EvolutionChain {
  id: number
  chain: ChainLink
}

export interface DamageRelations {
  no_damage_to: NamedApiResource[]
  half_damage_to: NamedApiResource[]
  double_damage_to: NamedApiResource[]
  no_damage_from: NamedApiResource[]
  half_damage_from: NamedApiResource[]
  double_damage_from: NamedApiResource[]
}

export interface Type {
  id: number
  name: string
  damage_relations: DamageRelations
}
