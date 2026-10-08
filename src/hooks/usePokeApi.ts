import useSWR from 'swr'
import {
  FALLBACK_SPECIES_COUNT,
  fetchJson,
  fetchPokemonByQuery,
  fetchSpeciesCount,
} from '../lib/api'
import { toSlug } from '../lib/slug'
import type { EvolutionChain, Pokemon, PokemonSpecies, Type } from '../types/pokeapi'

/** Look a Pokémon up by whatever the person typed. Keeps the previous result on screen while the next loads. */
export function usePokemon(query: string) {
  const slug = toSlug(query)
  return useSWR<Pokemon, Error>(slug ? `pokemon:${slug}` : null, () => fetchPokemonByQuery(slug), {
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

/** How many species exist, for picking a random one. Falls back to a known count until loaded. */
export function useSpeciesCount(): number {
  const { data } = useSWR<number, Error>('species-count', fetchSpeciesCount, {
    fallbackData: FALLBACK_SPECIES_COUNT,
  })
  return data ?? FALLBACK_SPECIES_COUNT
}
