import useSWR from 'swr'
import {
  FALLBACK_SPECIES_COUNT,
  fetchJson,
  fetchPokemonByQuery,
  fetchSpeciesCount,
} from '../lib/api'
import { toSlug } from '../lib/slug'
import type { EvolutionChain, Pokemon, PokemonSpecies, Type } from '../types/pokeapi'

/**
 * Look a Pokémon up by whatever the person typed. The previous result stays on screen while the
 * next one loads. The key always carries the slug, even an empty one, so an unusable query such
 * as "!!!" reaches the fetcher and surfaces as "not found" instead of leaving stale data in place.
 */
export function usePokemon(query: string) {
  const slug = toSlug(query)
  return useSWR<Pokemon, Error>(`pokemon:${slug}`, () => fetchPokemonByQuery(slug), {
    keepPreviousData: true,
  })
}

function useResource<T>(url: string | null | undefined) {
  return useSWR<T, Error>(url ?? null, (resourceUrl: string) => fetchJson<T>(resourceUrl))
}

export const useSpecies = (url: string | null | undefined) => useResource<PokemonSpecies>(url)

export const useEvolutionChain = (url: string | null | undefined) =>
  useResource<EvolutionChain>(url)

/** Load several type resources at once (a Pokémon has one or two). */
export function useTypes(urls: string[]) {
  return useSWR<Type[], Error>(urls.length > 0 ? ['types', ...urls] : null, () =>
    Promise.all(urls.map((url) => fetchJson<Type>(url))),
  )
}

/**
 * How many species exist, for picking a random one. A known count stands in until the live
 * number arrives. Deliberately not `fallbackData`: with background revalidation switched off,
 * SWR would treat a fallback as fresh data and never fetch at all.
 */
export function useSpeciesCount(): number {
  const { data } = useSWR<number, Error>('species-count', fetchSpeciesCount)
  return data ?? FALLBACK_SPECIES_COUNT
}
