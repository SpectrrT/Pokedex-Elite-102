import type { NamedApiResourceList, Pokemon, PokemonSpecies } from '../types/pokeapi'
import { toSlug } from './slug'

export const API_BASE = 'https://pokeapi.co/api/v2'

/** Species count to fall back on until the live count has loaded (National Dex through Gen 9). */
export const FALLBACK_SPECIES_COUNT = 1025

const SPRITE_BASE = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon'

export class ApiError extends Error {
  readonly status: number
  readonly url: string

  constructor(status: number, url: string) {
    super(`Request to ${url} failed with HTTP ${status}`)
    this.name = 'ApiError'
    this.status = status
    this.url = url
  }
}

export class NotFoundError extends Error {
  readonly query: string

  constructor(query: string) {
    super(`No Pokémon matches "${query}"`)
    this.name = 'NotFoundError'
    this.query = query
  }
}

const isHttpNotFound = (error: unknown): boolean =>
  error instanceof ApiError && error.status === 404

export async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url)
  if (!response.ok) throw new ApiError(response.status, url)
  return (await response.json()) as T
}

export const pokemonUrl = (nameOrId: string | number): string => `${API_BASE}/pokemon/${nameOrId}`

export const speciesUrl = (nameOrId: string | number): string =>
  `${API_BASE}/pokemon-species/${nameOrId}`

export const speciesCountUrl = (): string => `${API_BASE}/pokemon-species?limit=1`

/** Default sprite for a Pokémon id (the default form of a species shares the species' id). */
export const spriteUrl = (id: number): string => `${SPRITE_BASE}/${id}.png`

/** PokéAPI resource URLs end in `/{id}/`; pull that id out without another request. */
export function idFromUrl(url: string): number | null {
  const match = /\/(\d+)\/?$/.exec(url)
  return match?.[1] ? Number(match[1]) : null
}

/**
 * Resolve a search query (name, National Dex number or species name) to a Pokémon.
 *
 * The `/pokemon` endpoint only knows concrete forms ("deoxys-normal"), while people type and
 * evolution chains reference species names ("deoxys"). When the direct lookup misses, fall back
 * to the species and load its default variety.
 */
export async function fetchPokemonByQuery(rawQuery: string): Promise<Pokemon> {
  const query = toSlug(rawQuery)
  if (!query) throw new NotFoundError(rawQuery)

  try {
    return await fetchJson<Pokemon>(pokemonUrl(query))
  } catch (error) {
    if (!isHttpNotFound(error)) throw error
  }

  let species: PokemonSpecies
  try {
    species = await fetchJson<PokemonSpecies>(speciesUrl(query))
  } catch (error) {
    if (isHttpNotFound(error)) throw new NotFoundError(rawQuery)
    throw error
  }

  const variety = species.varieties.find((entry) => entry.is_default) ?? species.varieties[0]
  if (!variety) throw new NotFoundError(rawQuery)
  return fetchJson<Pokemon>(variety.pokemon.url)
}

export async function fetchSpeciesCount(): Promise<number> {
  const list = await fetchJson<NamedApiResourceList>(speciesCountUrl())
  return list.count
}

/** A National Dex number in 1…count. `random` is injectable so tests can be deterministic. */
export function randomPokemonId(count: number, random: () => number = Math.random): number {
  return 1 + Math.floor(random() * Math.max(1, count))
}
