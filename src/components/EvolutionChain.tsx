import { Fragment } from 'react'
import { useEvolutionChain } from '../hooks/usePokeApi'
import { idFromUrl, spriteUrl } from '../lib/api'
import { countChainSpecies, describeEvolution } from '../lib/evolution'
import { formatSpeciesName } from '../lib/format'
import type { ChainLink, PokemonSpecies } from '../types/pokeapi'
import { StatusMessage } from './StatusMessage'

interface EvolutionNodeProps {
  link: ChainLink
  currentSpeciesName: string
  onSelect: (speciesName: string) => void
}

function EvolutionNode({ link, currentSpeciesName, onSelect }: EvolutionNodeProps) {
  const id = idFromUrl(link.species.url)
  const name = formatSpeciesName(link.species.name)
  const isCurrent = link.species.name === currentSpeciesName
  const branches = link.evolves_to.length > 1

  return (
    <div className="evolution-branch">
      <button
        type="button"
        className={`evolution-stage${isCurrent ? ' evolution-stage--current' : ''}`}
        onClick={() => onSelect(link.species.name)}
        aria-current={isCurrent ? 'true' : undefined}
      >
        {id !== null && (
          <img src={spriteUrl(id)} alt="" width={96} height={96} loading="lazy" decoding="async" />
        )}
        <span className="evolution-stage__name">{name}</span>
      </button>

      {link.evolves_to.length > 0 && (
        <div className={`evolution-children${branches ? ' evolution-children--branching' : ''}`}>
          {link.evolves_to.map((child, index) => (
            <Fragment key={child.species.name}>
              {branches && index > 0 && (
                <div className="evolution-or" aria-hidden="true">
                  or
                </div>
              )}
              <div className="evolution-step">
                <div className="evolution-method">
                  <span className="evolution-arrow" aria-hidden="true">
                    →
                  </span>
                  {/* Spell the step out for assistive tech, which cannot see the tree layout. */}
                  <span className="visually-hidden">
                    {name} evolves into {formatSpeciesName(child.species.name)}:{' '}
                  </span>
                  <span className="small text-body-secondary">
                    {describeEvolution(child.evolution_details)}
                  </span>
                </div>
                <EvolutionNode
                  link={child}
                  currentSpeciesName={currentSpeciesName}
                  onSelect={onSelect}
                />
              </div>
            </Fragment>
          ))}
        </div>
      )}
    </div>
  )
}

interface EvolutionChainProps {
  species: PokemonSpecies
  currentSpeciesName: string
  onSelect: (speciesName: string) => void
}

/** The full evolution line for a species, with every stage clickable. */
export function EvolutionChain({ species, currentSpeciesName, onSelect }: EvolutionChainProps) {
  const { data, error, isLoading } = useEvolutionChain(species.evolution_chain.url)

  if (isLoading) return <StatusMessage kind="loading">Loading evolution line…</StatusMessage>
  if (error || !data) {
    return <StatusMessage kind="error">Couldn't load this Pokémon's evolution line.</StatusMessage>
  }
  if (countChainSpecies(data.chain) <= 1) {
    return (
      <p className="text-body-secondary mb-0">{formatSpeciesName(species.name)} does not evolve.</p>
    )
  }

  return (
    <div className="evolution-chain">
      <EvolutionNode
        link={data.chain}
        currentSpeciesName={currentSpeciesName}
        onSelect={onSelect}
      />
    </div>
  )
}
