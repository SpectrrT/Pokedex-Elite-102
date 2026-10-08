import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { API_BASE } from './lib/api'
import pikachu from './test/fixtures/pokemon-pikachu.json'
import { installFailingFetchMock, installFetchMock, jsonResponse } from './test/mockApi'
import { renderApp } from './test/renderApp'

type User = ReturnType<typeof userEvent.setup>

const EEVEELUTIONS = [
  'Vaporeon',
  'Jolteon',
  'Flareon',
  'Espeon',
  'Umbreon',
  'Leafeon',
  'Glaceon',
  'Sylveon',
]

beforeEach(() => {
  window.history.replaceState(null, '', '/')
  window.localStorage.clear()
  document.title = 'Pokédex'
  installFetchMock()
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

const searchFor = async (user: User, text: string) => {
  const input = screen.getByRole('searchbox', { name: /pokémon name or number/i })
  await user.clear(input)
  await user.type(input, text)
  await user.click(screen.getByRole('button', { name: /^search$/i }))
}

const matchupGroup = (title: string) => {
  const group = screen.getByRole('heading', { name: title }).parentElement
  if (!group) throw new Error(`matchup group "${title}" is missing`)
  return within(group)
}

describe('Pokédex', () => {
  it('starts with a search box and suggestions', () => {
    renderApp()
    expect(screen.getByRole('heading', { level: 1, name: /pokédex/i })).toBeInTheDocument()
    expect(screen.getByRole('searchbox', { name: /pokémon name or number/i })).toHaveValue('')
    expect(screen.getByRole('heading', { name: /search for any pokémon/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Eevee' })).toBeInTheDocument()
  })

  it('finds a Pokémon by name and shows its details', async () => {
    const user = userEvent.setup()
    renderApp()

    await searchFor(user, 'Pikachu')

    expect(await screen.findByRole('heading', { name: 'Pikachu' })).toBeInTheDocument()
    expect(screen.getByText('#0025')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: /official artwork of pikachu/i })).toBeInTheDocument()
    expect(await screen.findByText('Mouse Pokémon')).toBeInTheDocument()
    expect(screen.getByText('Static')).toBeInTheDocument()
    expect(screen.getByText(/lightning rod/i)).toHaveTextContent('(hidden)')
    expect(screen.getByText('0.4 m')).toBeInTheDocument()
    expect(screen.getByText('6.0 kg')).toBeInTheDocument()
    expect(screen.getByRole('progressbar', { name: 'Speed' })).toHaveAttribute(
      'aria-valuenow',
      '90',
    )
    expect(window.location.search).toBe('?pokemon=Pikachu')
    expect(document.title).toBe('Pikachu – Pokédex')
    expect(screen.getByRole('status')).toHaveTextContent('Showing Pikachu, number 25.')
  })

  it('derives weaknesses, resistances and strengths from the type chart', async () => {
    const user = userEvent.setup()
    renderApp()

    await searchFor(user, 'pikachu')

    await screen.findByRole('heading', { name: 'Weak to' })
    expect(matchupGroup('Weak to').getByText('Ground')).toBeInTheDocument()
    expect(matchupGroup('Weak to').getByText('2×')).toBeInTheDocument()
    expect(matchupGroup('Strong against').getByText('Water')).toBeInTheDocument()
    expect(matchupGroup('Strong against').getByText('Flying')).toBeInTheDocument()
    expect(matchupGroup('Resists').getByText('Steel')).toBeInTheDocument()
    expect(matchupGroup('Immune to').getByText('No immunities')).toBeInTheDocument()
  })

  it('shows the evolution line and navigates through it, with Back support', async () => {
    const user = userEvent.setup()
    renderApp()

    await searchFor(user, 'pikachu')

    expect(
      await screen.findByRole('button', { name: 'Pikachu', current: true }),
    ).toBeInTheDocument()
    expect(screen.getByText('Use Thunder Stone')).toBeInTheDocument()
    expect(screen.getByText('Level up with high friendship')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Raichu' }))

    expect(await screen.findByRole('heading', { name: 'Raichu' })).toBeInTheDocument()
    expect(screen.getByText('#0026')).toBeInTheDocument()
    expect(window.location.search).toBe('?pokemon=raichu')
    expect(screen.getByRole('searchbox')).toHaveValue('raichu')
    expect(await screen.findByRole('button', { name: 'Raichu', current: true })).toBeInTheDocument()

    // jsdom traverses history asynchronously and fires popstate itself.
    window.history.back()
    await waitFor(() => expect(window.location.search).toBe('?pokemon=pikachu'))
    expect(await screen.findByRole('heading', { name: 'Pikachu' })).toBeInTheDocument()
    expect(screen.getByRole('searchbox')).toHaveValue('pikachu')
  })

  it('renders a branching evolution line', async () => {
    const user = userEvent.setup()
    const { container } = renderApp()

    await searchFor(user, 'eevee')

    expect(await screen.findByRole('button', { name: 'Eevee', current: true })).toBeInTheDocument()
    for (const name of EEVEELUTIONS) {
      expect(screen.getByRole('button', { name })).not.toHaveAttribute('aria-current')
    }
    expect(screen.getByText('Eevee evolves into Umbreon:')).toBeInTheDocument()
    expect(screen.getByText('Level up with high friendship at night')).toBeInTheDocument()
    expect(container.querySelectorAll('.evolution-or')).toHaveLength(EEVEELUTIONS.length - 1)
  })

  it('does not stack history entries when re-selecting the Pokémon already shown', async () => {
    const user = userEvent.setup()
    renderApp()

    await searchFor(user, 'Pikachu')
    const current = await screen.findByRole('button', { name: 'Pikachu', current: true })
    const entries = window.history.length

    await user.click(current)
    expect(window.location.search).toBe('?pokemon=pikachu')
    expect(screen.getByRole('searchbox')).toHaveValue('pikachu')

    await user.click(screen.getByRole('button', { name: /^search$/i }))
    expect(window.history.length).toBe(entries)
    expect(await screen.findByRole('heading', { name: 'Pikachu' })).toBeInTheDocument()
  })

  it('treats differently encoded URLs as the same history entry', async () => {
    window.history.replaceState(null, '', '/?pokemon=mr%20mime')
    const user = userEvent.setup()
    renderApp()

    await screen.findByRole('heading', { name: /no pokémon found/i })
    const entries = window.history.length

    await user.click(screen.getByRole('button', { name: /^search$/i }))
    expect(window.history.length).toBe(entries)
    expect(window.location.search).toBe('?pokemon=mr%20mime')
  })

  it('resolves a species name to its default form', async () => {
    const user = userEvent.setup()
    renderApp()

    await searchFor(user, 'Deoxys')

    expect(await screen.findByRole('heading', { name: 'Deoxys (Normal)' })).toBeInTheDocument()
    expect(await screen.findByText('Deoxys does not evolve.')).toBeInTheDocument()
    expect(await screen.findByText('Mythical')).toBeInTheDocument()
  })

  it('shows the National Dex number for alternate forms', async () => {
    const user = userEvent.setup()
    renderApp()

    await searchFor(user, 'deoxys-attack')

    expect(await screen.findByRole('heading', { name: 'Deoxys (Attack)' })).toBeInTheDocument()
    expect(screen.getByText('#0386')).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Showing Deoxys (Attack), number 386.')
  })

  it('explains when nothing matches', async () => {
    const user = userEvent.setup()
    renderApp()

    await searchFor(user, 'Missingno')

    expect(await screen.findByRole('heading', { name: /no pokémon found/i })).toBeInTheDocument()
    expect(screen.getByText(/nothing in the pokédex matches “Missingno”/i)).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('No Pokémon found for “Missingno”.')
    expect(document.title).toBe('Pokédex')
  })

  it('treats a query with no usable characters as not found', async () => {
    const user = userEvent.setup()
    renderApp()

    await searchFor(user, 'pikachu')
    await screen.findByRole('heading', { name: 'Pikachu' })

    await searchFor(user, '!!!')

    expect(await screen.findByRole('heading', { name: /no pokémon found/i })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Pikachu' })).not.toBeInTheDocument()
  })

  it('shows an error when PokéAPI is unreachable', async () => {
    installFailingFetchMock()
    const user = userEvent.setup()
    renderApp()

    await searchFor(user, 'pikachu')

    expect(await screen.findByRole('alert')).toHaveTextContent(/something went wrong/i)
  })

  it('shows a loading state while retrying a lookup that failed before', async () => {
    const gate = { release: () => {} }
    const pending = new Promise<void>((resolve) => {
      gate.release = resolve
    })
    let attempts = 0
    installFetchMock({
      [`${API_BASE}/pokemon/pikachu`]: async () => {
        attempts += 1
        if (attempts === 1) throw new TypeError('Failed to fetch')
        await pending
        return jsonResponse(pikachu)
      },
    })
    const user = userEvent.setup()
    renderApp()

    await searchFor(user, 'pikachu')
    expect(await screen.findByRole('alert')).toHaveTextContent(/something went wrong/i)

    await searchFor(user, 'raichu')
    await screen.findByRole('heading', { name: 'Raichu' })

    await searchFor(user, 'pikachu')
    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent('Searching for “pikachu”…'),
    )
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()

    gate.release()
    expect(await screen.findByRole('heading', { name: 'Pikachu' })).toBeInTheDocument()
  })

  it('reports when the species details cannot be loaded', async () => {
    installFetchMock({
      [`${API_BASE}/pokemon-species/25/`]: () => new Response('Server Error', { status: 500 }),
    })
    const user = userEvent.setup()
    renderApp()

    await searchFor(user, 'pikachu')

    expect(await screen.findByRole('heading', { name: 'Pikachu' })).toBeInTheDocument()
    expect(
      await screen.findByText(/couldn't load this pokémon's species details/i),
    ).toBeInTheDocument()
  })

  it('picks a random Pokémon', async () => {
    // 1 + floor(0.0236 × 1025) = 25, Pikachu's National Dex number.
    vi.spyOn(Math, 'random').mockReturnValue(0.0236)
    const user = userEvent.setup()
    renderApp()

    await user.click(screen.getByRole('button', { name: /^random$/i }))

    expect(await screen.findByRole('heading', { name: 'Pikachu' })).toBeInTheDocument()
    expect(window.location.search).toBe('?pokemon=25')
  })

  it('uses the live species count when picking at random', async () => {
    installFetchMock({
      [`${API_BASE}/pokemon-species?limit=1`]: {
        count: 1100,
        next: null,
        previous: null,
        results: [],
      },
    })
    vi.spyOn(Math, 'random').mockReturnValue(0.9999)
    const user = userEvent.setup()
    renderApp()

    // The built-in fallback is 1025; wait for the live count before rolling.
    const random = await screen.findByRole('button', { name: 'Random', description: /1,100/ })
    await user.click(random)

    expect(window.location.search).toBe('?pokemon=1100')
  })

  it('restores the Pokémon named in the URL', async () => {
    window.history.replaceState(null, '', '/?pokemon=raichu')
    renderApp()

    expect(await screen.findByRole('heading', { name: 'Raichu' })).toBeInTheDocument()
    expect(screen.getByRole('searchbox')).toHaveValue('raichu')
  })

  it('returns home from the brand link and from a suggestion chip', async () => {
    const user = userEvent.setup()
    renderApp()

    await user.click(screen.getByRole('button', { name: 'Eevee' }))
    expect(window.location.search).toBe('?pokemon=Eevee')
    await screen.findByRole('heading', { name: 'Eevee' })
    expect(document.title).toBe('Eevee – Pokédex')

    await user.click(screen.getByRole('link', { name: /pokédex/i }))
    expect(window.location.search).toBe('')
    expect(screen.getByRole('heading', { name: /search for any pokémon/i })).toBeInTheDocument()
    expect(document.title).toBe('Pokédex')
  })

  it('toggles between light and dark mode and remembers the choice', async () => {
    const user = userEvent.setup()
    renderApp()

    expect(document.documentElement).toHaveAttribute('data-bs-theme', 'light')
    await user.click(screen.getByRole('button', { name: /switch to dark mode/i }))
    expect(document.documentElement).toHaveAttribute('data-bs-theme', 'dark')
    expect(window.localStorage.getItem('pokedex-theme')).toBe('dark')
    expect(screen.getByRole('button', { name: /switch to light mode/i })).toBeInTheDocument()
  })
})
