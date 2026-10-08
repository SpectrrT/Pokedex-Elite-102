import { vi } from 'vitest'
import { API_BASE } from '../lib/api'
import chain10 from './fixtures/evolution-chain-10.json'
import chain202 from './fixtures/evolution-chain-202.json'
import chain67 from './fixtures/evolution-chain-67.json'
import deoxysAttack from './fixtures/pokemon-deoxys-attack.json'
import deoxysNormal from './fixtures/pokemon-deoxys-normal.json'
import eevee from './fixtures/pokemon-eevee.json'
import pikachu from './fixtures/pokemon-pikachu.json'
import raichu from './fixtures/pokemon-raichu.json'
import speciesDeoxys from './fixtures/species-deoxys.json'
import speciesEevee from './fixtures/species-eevee.json'
import speciesList from './fixtures/species-list.json'
import speciesPikachu from './fixtures/species-pikachu.json'
import speciesRaichu from './fixtures/species-raichu.json'
import typeElectric from './fixtures/type-electric.json'
import typeNormal from './fixtures/type-normal.json'
import typePsychic from './fixtures/type-psychic.json'

/** A route either serves an object as JSON with status 200, or runs a handler that builds the Response. */
export type RouteHandler = () => Response | Promise<Response>
export type Route = RouteHandler | Record<string, unknown>

/** Real (trimmed) PokéAPI responses keyed by URL. Trailing slashes are ignored when matching. */
export const routes: Record<string, Route> = {
  [`${API_BASE}/pokemon/pikachu`]: pikachu,
  [`${API_BASE}/pokemon/25`]: pikachu,
  [`${API_BASE}/pokemon/raichu`]: raichu,
  [`${API_BASE}/pokemon/26`]: raichu,
  [`${API_BASE}/pokemon/deoxys-normal`]: deoxysNormal,
  [`${API_BASE}/pokemon/386`]: deoxysNormal,
  [`${API_BASE}/pokemon/deoxys-attack`]: deoxysAttack,
  [`${API_BASE}/pokemon/10001`]: deoxysAttack,
  [`${API_BASE}/pokemon/eevee`]: eevee,
  [`${API_BASE}/pokemon/133`]: eevee,
  [`${API_BASE}/pokemon-species/pikachu`]: speciesPikachu,
  [`${API_BASE}/pokemon-species/25`]: speciesPikachu,
  [`${API_BASE}/pokemon-species/raichu`]: speciesRaichu,
  [`${API_BASE}/pokemon-species/26`]: speciesRaichu,
  [`${API_BASE}/pokemon-species/deoxys`]: speciesDeoxys,
  [`${API_BASE}/pokemon-species/386`]: speciesDeoxys,
  [`${API_BASE}/pokemon-species/eevee`]: speciesEevee,
  [`${API_BASE}/pokemon-species/133`]: speciesEevee,
  [`${API_BASE}/evolution-chain/10`]: chain10,
  [`${API_BASE}/evolution-chain/67`]: chain67,
  [`${API_BASE}/evolution-chain/202`]: chain202,
  [`${API_BASE}/type/1`]: typeNormal,
  [`${API_BASE}/type/13`]: typeElectric,
  [`${API_BASE}/type/14`]: typePsychic,
  [`${API_BASE}/pokemon-species?limit=1`]: speciesList,
}

const normalize = (url: string): string => url.replace(/\/$/, '')

export const jsonResponse = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })

export const requestUrl = (input: RequestInfo | URL): string => {
  if (typeof input === 'string') return input
  if (input instanceof URL) return input.href
  return input.url
}

/**
 * Replace global fetch with a router over the fixtures. `overrides` add or replace routes for one
 * test; unknown URLs get PokéAPI's 404 shape.
 */
export function installFetchMock(overrides: Record<string, Route> = {}) {
  // Key by normalised URL so an override written with a trailing slash replaces the base route.
  const table = new Map<string, Route>()
  for (const [url, route] of Object.entries({ ...routes, ...overrides })) {
    table.set(normalize(url), route)
  }
  const fetchMock = vi.fn(async (input: RequestInfo | URL): Promise<Response> => {
    const route = table.get(normalize(requestUrl(input)))
    if (route === undefined) return jsonResponse({ detail: 'Not found.' }, 404)
    return typeof route === 'function' ? route() : jsonResponse(route)
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
