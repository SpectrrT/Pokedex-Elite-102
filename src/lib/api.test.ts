import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { installFetchMock, requestUrl } from '../test/mockApi'
import {
  ApiError,
  NotFoundError,
  fetchJson,
  fetchPokemonByQuery,
  fetchSpeciesCount,
  idFromUrl,
  randomPokemonId,
} from './api'

describe('idFromUrl', () => {
  it('extracts the trailing id from a resource URL', () => {
    expect(idFromUrl('https://pokeapi.co/api/v2/pokemon-species/172/')).toBe(172)
    expect(idFromUrl('https://pokeapi.co/api/v2/type/13')).toBe(13)
    expect(idFromUrl('https://pokeapi.co/api/v2/pokemon-species?limit=1')).toBeNull()
  })
})

describe('randomPokemonId', () => {
  it('stays within 1…count', () => {
    expect(randomPokemonId(1025, () => 0)).toBe(1)
    expect(randomPokemonId(1025, () => 0.999999)).toBe(1025)
    expect(randomPokemonId(0, () => 0.5)).toBe(1)
  })
})

describe('PokéAPI requests', () => {
  let fetchMock: ReturnType<typeof installFetchMock>

  beforeEach(() => {
    fetchMock = installFetchMock()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('throws an ApiError carrying the status for non-2xx responses', async () => {
    await expect(fetchJson('https://pokeapi.co/api/v2/pokemon/nope')).rejects.toMatchObject({
      name: 'ApiError',
      status: 404,
    })
  })

  it('finds a Pokémon by name, ignoring case and whitespace', async () => {
    const pokemon = await fetchPokemonByQuery('  PIKACHU ')
    expect(pokemon.name).toBe('pikachu')
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('finds a Pokémon by National Dex number', async () => {
    const pokemon = await fetchPokemonByQuery('#025')
    expect(pokemon.id).toBe(25)
  })

  it('falls back from a species name to its default form', async () => {
    const pokemon = await fetchPokemonByQuery('Deoxys')
    expect(pokemon.name).toBe('deoxys-normal')
    const urls = fetchMock.mock.calls.map(([input]) => requestUrl(input))
    expect(urls).toEqual([
      'https://pokeapi.co/api/v2/pokemon/deoxys',
      'https://pokeapi.co/api/v2/pokemon-species/deoxys',
      'https://pokeapi.co/api/v2/pokemon/386/',
    ])
  })

  it('reports a NotFoundError when neither lookup matches', async () => {
    await expect(fetchPokemonByQuery('Missingno')).rejects.toBeInstanceOf(NotFoundError)
    await expect(fetchPokemonByQuery('???')).rejects.toBeInstanceOf(NotFoundError)
  })

  it('re-throws unexpected server errors instead of masking them as not found', async () => {
    fetchMock.mockResolvedValueOnce(new Response('oops', { status: 500 }))
    await expect(fetchPokemonByQuery('pikachu')).rejects.toBeInstanceOf(ApiError)
  })

  it('reads the species count from the list endpoint', async () => {
    await expect(fetchSpeciesCount()).resolves.toBe(1025)
  })
})
