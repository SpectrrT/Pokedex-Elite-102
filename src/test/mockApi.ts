import { vi } from 'vitest'
import { API_BASE } from '../lib/api'
import chain10 from './fixtures/evolution-chain-10.json'
import chain202 from './fixtures/evolution-chain-202.json'
import deoxysNormal from './fixtures/pokemon-deoxys-normal.json'
import pikachu from './fixtures/pokemon-pikachu.json'
import raichu from './fixtures/pokemon-raichu.json'
import speciesDeoxys from './fixtures/species-deoxys.json'
import speciesList from './fixtures/species-list.json'
import speciesPikachu from './fixtures/species-pikachu.json'
import speciesRaichu from './fixtures/species-raichu.json'
import typeElectric from './fixtures/type-electric.json'
import typePsychic from './fixtures/type-psychic.json'

/** Real (trimmed) PokéAPI responses keyed by URL. Trailing slashes are ignored when matching. */
export const routes: Record<string, unknown> = {
  [`${API_BASE}/pokemon/pikachu`]: pikachu,
  [`${API_BASE}/pokemon/25`]: pikachu,
  [`${API_BASE}/pokemon/raichu`]: raichu,
  [`${API_BASE}/pokemon/26`]: raichu,
  [`${API_BASE}/pokemon/deoxys-normal`]: deoxysNormal,
  [`${API_BASE}/pokemon/386`]: deoxysNormal,
  [`${API_BASE}/pokemon-species/pikachu`]: speciesPikachu,
  [`${API_BASE}/pokemon-species/25`]: speciesPikachu,
  [`${API_BASE}/pokemon-species/raichu`]: speciesRaichu,
  [`${API_BASE}/pokemon-species/26`]: speciesRaichu,
  [`${API_BASE}/pokemon-species/deoxys`]: speciesDeoxys,
  [`${API_BASE}/pokemon-species/386`]: speciesDeoxys,
  [`${API_BASE}/evolution-chain/10`]: chain10,
  [`${API_BASE}/evolution-chain/202`]: chain202,
  [`${API_BASE}/type/13`]: typeElectric,
  [`${API_BASE}/type/14`]: typePsychic,
  [`${API_BASE}/pokemon-species?limit=1`]: speciesList,
}

const normalize = (url: string): string => url.replace(/\/$/, '')

const jsonResponse = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })

export const requestUrl = (input: RequestInfo | URL): string => {
  if (typeof input === 'string') return input
  if (input instanceof URL) return input.href
  return input.url
}

/** Replace global fetch with a router over the fixtures; unknown URLs get PokéAPI's 404 shape. */
export function installFetchMock() {
  const fetchMock = vi.fn(async (input: RequestInfo | URL): Promise<Response> => {
    const key = normalize(requestUrl(input))
    const match = Object.entries(routes).find(([url]) => normalize(url) === key)
    return match ? jsonResponse(match[1]) : jsonResponse({ detail: 'Not found.' }, 404)
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

/** Simulate a network outage: every request rejects the way browsers do. */
export function installFailingFetchMock() {
  const fetchMock = vi.fn(async (): Promise<Response> => {
    throw new TypeError('Failed to fetch')
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}
