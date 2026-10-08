import { act, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { installFailingFetchMock, installFetchMock } from './test/mockApi'
import { renderApp } from './test/renderApp'

beforeEach(() => {
  window.history.replaceState(null, '', '/')
  window.localStorage.clear()
  installFetchMock()
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

const searchFor = async (user: ReturnType<typeof userEvent.setup>, text: string) => {
  const input = screen.getByRole('searchbox', { name: /pokémon name or number/i })
  await user.clear(input)
  await user.type(input, text)
  await user.click(screen.getByRole('button', { name: /^search$/i }))
}

describe('Pokédex', () => {
  it('starts with a search box and suggestions', () => {
    renderApp()
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
  })

  it('derives weaknesses, resistances and strengths from the type chart', async () => {
    const user = userEvent.setup()
    renderApp()

    await searchFor(user, 'pikachu')

    const weakTo = await screen.findByRole('heading', { name: 'Weak to' })
    const weakGroup = weakTo.parentElement
    if (!weakGroup) throw new Error('matchup group missing')
    expect(within(weakGroup).getByText('Ground')).toBeInTheDocument()
    expect(within(weakGroup).getByText('2×')).toBeInTheDocument()

    const strongGroup = screen.getByRole('heading', { name: 'Strong against' }).parentElement
    if (!strongGroup) throw new Error('matchup group missing')
    expect(within(strongGroup).getByText('Water')).toBeInTheDocument()
    expect(within(strongGroup).getByText('Flying')).toBeInTheDocument()

    const immuneGroup = screen.getByRole('heading', { name: 'Immune to' }).parentElement
    if (!immuneGroup) throw new Error('matchup group missing')
    expect(within(immuneGroup).getByText('No immunities')).toBeInTheDocument()
  })

  it('shows the evolution line and navigates through it, with Back support', async () => {
    const user = userEvent.setup()
    renderApp()

    await searchFor(user, 'pikachu')

    const current = await screen.findByRole('button', { name: 'Pikachu', current: true })
    expect(current).toBeInTheDocument()
    expect(screen.getByText('Use Thunder Stone')).toBeInTheDocument()
    expect(screen.getByText('Level up with high friendship')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Raichu' }))

    expect(await screen.findByRole('heading', { name: 'Raichu' })).toBeInTheDocument()
    expect(screen.getByText('#0026')).toBeInTheDocument()
    expect(window.location.search).toBe('?pokemon=raichu')
    expect(screen.getByRole('searchbox')).toHaveValue('raichu')
    expect(await screen.findByRole('button', { name: 'Raichu', current: true })).toBeInTheDocument()

    act(() => {
      window.history.back()
      window.dispatchEvent(new PopStateEvent('popstate'))
    })

    expect(await screen.findByRole('heading', { name: 'Pikachu' })).toBeInTheDocument()
  })

  it('resolves a species name to its default form', async () => {
    const user = userEvent.setup()
    renderApp()

    await searchFor(user, 'Deoxys')

    expect(await screen.findByRole('heading', { name: 'Deoxys (Normal)' })).toBeInTheDocument()
    expect(await screen.findByText('Deoxys does not evolve.')).toBeInTheDocument()
    expect(await screen.findByText('Mythical')).toBeInTheDocument()
  })

  it('explains when nothing matches', async () => {
    const user = userEvent.setup()
    renderApp()

    await searchFor(user, 'Missingno')

    expect(await screen.findByRole('heading', { name: /no pokémon found/i })).toBeInTheDocument()
    expect(screen.getByText(/“Missingno”/)).toBeInTheDocument()
  })

  it('shows an error when PokéAPI is unreachable', async () => {
    installFailingFetchMock()
    const user = userEvent.setup()
    renderApp()

    await searchFor(user, 'pikachu')

    expect(await screen.findByRole('alert')).toHaveTextContent(/something went wrong/i)
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

    await user.click(screen.getByRole('link', { name: /pokédex/i }))
    expect(window.location.search).toBe('')
    expect(screen.getByRole('heading', { name: /search for any pokémon/i })).toBeInTheDocument()
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
