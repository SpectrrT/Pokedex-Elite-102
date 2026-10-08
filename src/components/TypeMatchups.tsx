import type { ReactNode } from 'react'
import { useTypes } from '../hooks/usePokeApi'
import { computeMatchups, formatMultiplier } from '../lib/effectiveness'
import type { PokemonType } from '../types/pokeapi'
import { StatusMessage } from './StatusMessage'
import { TypeBadge } from './TypeBadge'

interface MatchupGroupProps {
  title: string
  emptyText: string
  children: ReactNode[]
}

function MatchupGroup({ title, emptyText, children }: MatchupGroupProps) {
  return (
    <div className="col-12 col-md-6">
      <h4 className="matchup-title">{title}</h4>
      <div className="d-flex flex-wrap gap-2">
        {children.length > 0 ? (
          children
        ) : (
          <span className="text-body-secondary small">{emptyText}</span>
        )}
      </div>
    </div>
  )
}

/** Weaknesses, resistances, immunities and offensive strengths derived from the Pokémon's types. */
export function TypeMatchups({ types }: { types: PokemonType[] }) {
  const { data, error, isLoading } = useTypes(types.map((entry) => entry.type.url))

  if (types.length === 0) return null
  if (isLoading) return <StatusMessage kind="loading">Loading type matchups…</StatusMessage>
  if (error || !data) {
    return <StatusMessage kind="error">Couldn't load this Pokémon's type matchups.</StatusMessage>
  }

  const { weaknesses, resistances, immunities, strengths } = computeMatchups(
    data.map((type) => type.damage_relations),
  )

  return (
    <div className="row g-3">
      <MatchupGroup title="Weak to" emptyText="No weaknesses">
        {weaknesses.map((matchup) => (
          <TypeBadge
            key={matchup.type}
            type={matchup.type}
            detail={formatMultiplier(matchup.multiplier)}
          />
        ))}
      </MatchupGroup>
      <MatchupGroup title="Strong against" emptyText="No super-effective attacks">
        {strengths.map((type) => (
          <TypeBadge key={type} type={type} />
        ))}
      </MatchupGroup>
      <MatchupGroup title="Resists" emptyText="No resistances">
        {resistances.map((matchup) => (
          <TypeBadge
            key={matchup.type}
            type={matchup.type}
            detail={formatMultiplier(matchup.multiplier)}
          />
        ))}
      </MatchupGroup>
      <MatchupGroup title="Immune to" emptyText="No immunities">
        {immunities.map((type) => (
          <TypeBadge key={type} type={type} />
        ))}
      </MatchupGroup>
    </div>
  )
}
