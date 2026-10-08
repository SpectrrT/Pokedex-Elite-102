import type { ChainLink, EvolutionDetail } from '../types/pokeapi'
import { humanize } from './format'

/** Friendlier wording for the rarer evolution triggers; anything unlisted falls back to its humanized slug. */
const TRIGGER_LABELS: Record<string, string> = {
  shed: 'Reach level 20 with a free party slot and a Poké Ball',
  spin: 'Spin around while holding a Sweet',
  'tower-of-darkness': 'Train in the Tower of Darkness',
  'tower-of-waters': 'Train in the Tower of Waters',
  'three-critical-hits': 'Land three critical hits in one battle',
  'take-damage': 'Take damage, then pass under the rock arch in Dusty Bowl',
  'agile-style-move': 'Use an agile-style move 20 times',
  'strong-style-move': 'Use a strong-style move 20 times',
  'recoil-damage': 'Take enough recoil damage without fainting',
  other: 'Special method',
}

const TIME_OF_DAY: Record<string, string> = {
  day: 'during the day',
  night: 'at night',
  dusk: 'at dusk',
  'full-moon': 'during a full moon',
}

const RELATIVE_STATS: Record<number, string> = {
  1: 'with Attack higher than Defense',
  0: 'with Attack equal to Defense',
  [-1]: 'with Attack lower than Defense',
}

function baseAction(detail: EvolutionDetail): string {
  const trigger = detail.trigger.name
  switch (trigger) {
    case 'level-up':
      return detail.min_level ? `Reach level ${detail.min_level}` : 'Level up'
    case 'trade':
      return detail.trade_species ? `Trade for ${humanize(detail.trade_species.name)}` : 'Trade'
    case 'use-item':
      return detail.item ? `Use ${humanize(detail.item.name)}` : 'Use an item'
    default:
      return TRIGGER_LABELS[trigger] ?? humanize(trigger)
  }
}

/** Build a short, human-readable description of one way a Pokémon evolves. */
export function describeEvolutionDetail(detail: EvolutionDetail): string {
  const parts = [baseAction(detail)]

  if (detail.held_item) parts.push(`while holding ${humanize(detail.held_item.name)}`)
  if (detail.known_move) parts.push(`knowing ${humanize(detail.known_move.name)}`)
  if (detail.known_move_type) {
    parts.push(`knowing a ${humanize(detail.known_move_type.name)}-type move`)
  }
  if (detail.min_happiness) parts.push('with high friendship')
  if (detail.min_affection) parts.push('with high affection')
  if (detail.min_beauty) parts.push('with high beauty')
  if (detail.time_of_day) parts.push(TIME_OF_DAY[detail.time_of_day] ?? `at ${detail.time_of_day}`)
  if (detail.location) parts.push(`at ${humanize(detail.location.name)}`)
  if (detail.needs_overworld_rain) parts.push('while it is raining')
  if (detail.turn_upside_down) parts.push('with the console held upside down')
  if (detail.relative_physical_stats !== null) {
    const stats = RELATIVE_STATS[detail.relative_physical_stats]
    if (stats) parts.push(stats)
  }
  if (detail.party_species) parts.push(`with ${humanize(detail.party_species.name)} in the party`)
  if (detail.party_type)
    parts.push(`with a ${humanize(detail.party_type.name)}-type Pokémon in the party`)
  if (detail.gender === 1) parts.push('(female only)')
  if (detail.gender === 2) parts.push('(male only)')

  return parts.join(' ')
}

/** Describe every distinct way to reach this stage, e.g. "Use Leaf Stone or Level up at Moss Rock". */
export function describeEvolution(details: EvolutionDetail[]): string {
  const unique = [...new Set(details.map(describeEvolutionDetail))]
  return unique.join(' or ')
}

/** Total species in a chain, so the UI can tell a lone Pokémon from an evolution line. */
export function countChainSpecies(link: ChainLink): number {
  return 1 + link.evolves_to.reduce((total, child) => total + countChainSpecies(child), 0)
}
