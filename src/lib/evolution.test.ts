// @vitest-environment node
import { describe, expect, it } from 'vitest'
import chain10 from '../test/fixtures/evolution-chain-10.json'
import chain202 from '../test/fixtures/evolution-chain-202.json'
import chain67 from '../test/fixtures/evolution-chain-67.json'
import type { ChainLink, EvolutionChain, EvolutionDetail } from '../types/pokeapi'
import { countChainSpecies, describeEvolution, describeEvolutionDetail } from './evolution'

const eevee = (chain67 as EvolutionChain).chain
const pichu = (chain10 as EvolutionChain).chain

const stage = (link: ChainLink, name: string): ChainLink => {
  const found = link.evolves_to.find((child) => child.species.name === name)
  if (!found) throw new Error(`${name} is not an evolution of ${link.species.name}`)
  return found
}

const detail = (overrides: Partial<EvolutionDetail>): EvolutionDetail => ({
  item: null,
  trigger: { name: 'level-up', url: '' },
  gender: null,
  held_item: null,
  known_move: null,
  known_move_type: null,
  location: null,
  min_level: null,
  min_happiness: null,
  min_beauty: null,
  min_affection: null,
  needs_overworld_rain: false,
  party_species: null,
  party_type: null,
  relative_physical_stats: null,
  time_of_day: '',
  trade_species: null,
  turn_upside_down: false,
  ...overrides,
})

describe('describeEvolution with real chains', () => {
  it('describes the Pichu line', () => {
    const pikachu = stage(pichu, 'pikachu')
    const raichu = stage(pikachu, 'raichu')
    expect(describeEvolution(pikachu.evolution_details)).toBe('Level up with high friendship')
    // PokéAPI lists the Thunder Stone once per game era; the description collapses duplicates.
    expect(raichu.evolution_details).toHaveLength(2)
    expect(describeEvolution(raichu.evolution_details)).toBe('Use Thunder Stone')
  })

  it('describes the Eeveelutions', () => {
    expect(describeEvolution(stage(eevee, 'vaporeon').evolution_details)).toBe('Use Water Stone')
    expect(describeEvolution(stage(eevee, 'espeon').evolution_details)).toBe(
      'Level up with high friendship during the day',
    )
    expect(describeEvolution(stage(eevee, 'umbreon').evolution_details)).toBe(
      'Level up with high friendship at night',
    )
    expect(describeEvolution(stage(eevee, 'sylveon').evolution_details)).toContain(
      'knowing a Fairy-type move',
    )
  })

  it('joins distinct methods with "or"', () => {
    const leafeon = describeEvolution(stage(eevee, 'leafeon').evolution_details)
    expect(leafeon).toContain('Use Leaf Stone')
    expect(leafeon).toMatch(/^Level up at .+ or /)
  })
})

describe('describeEvolutionDetail', () => {
  it('handles levels, trades and items', () => {
    expect(describeEvolutionDetail(detail({ min_level: 16 }))).toBe('Reach level 16')
    expect(describeEvolutionDetail(detail({ trigger: { name: 'trade', url: '' } }))).toBe('Trade')
    expect(
      describeEvolutionDetail(
        detail({
          trigger: { name: 'trade', url: '' },
          held_item: { name: 'metal-coat', url: '' },
        }),
      ),
    ).toBe('Trade while holding Metal Coat')
    expect(
      describeEvolutionDetail(
        detail({
          trigger: { name: 'trade', url: '' },
          trade_species: { name: 'shelmet', url: '' },
        }),
      ),
    ).toBe('Trade for Shelmet')
    expect(
      describeEvolutionDetail(
        detail({ trigger: { name: 'use-item', url: '' }, item: { name: 'fire-stone', url: '' } }),
      ),
    ).toBe('Use Fire Stone')
  })

  it('appends every extra condition', () => {
    expect(
      describeEvolutionDetail(
        detail({
          min_level: 20,
          known_move: { name: 'ancient-power', url: '' },
          gender: 1,
        }),
      ),
    ).toBe('Reach level 20 knowing Ancient Power (female only)')
    expect(describeEvolutionDetail(detail({ location: { name: 'mt-coronet', url: '' } }))).toBe(
      'Level up at Mt Coronet',
    )
    expect(describeEvolutionDetail(detail({ min_level: 20, relative_physical_stats: 1 }))).toBe(
      'Reach level 20 with Attack higher than Defense',
    )
    expect(
      describeEvolutionDetail(
        detail({
          party_species: { name: 'remoraid', url: '' },
          needs_overworld_rain: true,
          turn_upside_down: true,
        }),
      ),
    ).toBe(
      'Level up while it is raining with the console held upside down with Remoraid in the party',
    )
  })

  it('uses friendly labels for the special triggers', () => {
    expect(describeEvolutionDetail(detail({ trigger: { name: 'shed', url: '' } }))).toMatch(
      /level 20/i,
    )
    expect(
      describeEvolutionDetail(detail({ trigger: { name: 'brand-new-trigger', url: '' } })),
    ).toBe('Brand New Trigger')
  })
})

describe('countChainSpecies', () => {
  it('counts every stage across branches', () => {
    expect(countChainSpecies(pichu)).toBe(3)
    expect(countChainSpecies(eevee)).toBe(9)
    expect(countChainSpecies((chain202 as EvolutionChain).chain)).toBe(1)
  })
})
