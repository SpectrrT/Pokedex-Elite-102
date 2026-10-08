import {
  englishFlavorText,
  englishGenus,
  formatDexNumber,
  formatHeight,
  formatPokemonName,
  formatWeight,
  humanize,
} from '../lib/format'
import type { Pokemon, PokemonSpecies } from '../types/pokeapi'
import { EvolutionChain } from './EvolutionChain'
import { StatBars } from './StatBars'
import { StatusMessage } from './StatusMessage'
import { TypeBadge } from './TypeBadge'
import { TypeMatchups } from './TypeMatchups'

interface PokemonCardProps {
  pokemon: Pokemon
  /** Species data loads separately; the card renders what it can until it arrives. */
  species: PokemonSpecies | undefined
  onSelectSpecies: (speciesName: string) => void
}

export function PokemonCard({ pokemon, species, onSelectSpecies }: PokemonCardProps) {
  const displayName = formatPokemonName(pokemon.name, pokemon.species.name)
  const artwork =
    pokemon.sprites.other?.['official-artwork']?.front_default ?? pokemon.sprites.front_default
  const genus = species ? englishGenus(species) : null
  const flavorText = species ? englishFlavorText(species) : null

  return (
    <article className="card pokemon-card shadow-sm" aria-labelledby="pokemon-name">
      <div className="card-body p-4">
        <div className="row g-4 align-items-center">
          <div className="col-12 col-md-5 text-center">
            {artwork ? (
              <img
                className="pokemon-artwork"
                src={artwork}
                alt={`Official artwork of ${displayName}`}
                width={320}
                height={320}
              />
            ) : (
              <div className="pokemon-artwork pokemon-artwork--missing" aria-hidden="true" />
            )}
          </div>

          <div className="col-12 col-md-7">
            <p className="dex-number mb-1">{formatDexNumber(pokemon.id)}</p>
            <h2 id="pokemon-name" className="display-6 fw-bold mb-1">
              {displayName}
            </h2>
            {genus && <p className="text-body-secondary mb-2">{genus}</p>}

            <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
              {pokemon.types.map((entry) => (
                <TypeBadge key={entry.slot} type={entry.type.name} />
              ))}
              {species?.is_legendary && <span className="badge text-bg-warning">Legendary</span>}
              {species?.is_mythical && <span className="badge text-bg-info">Mythical</span>}
              {species?.is_baby && <span className="badge text-bg-light border">Baby</span>}
            </div>

            {flavorText && <p className="flavor-text mb-3">{flavorText}</p>}

            <dl className="row mb-0 small">
              <dt className="col-4 col-sm-3">Height</dt>
              <dd className="col-8 col-sm-9">{formatHeight(pokemon.height)}</dd>
              <dt className="col-4 col-sm-3">Weight</dt>
              <dd className="col-8 col-sm-9">{formatWeight(pokemon.weight)}</dd>
              <dt className="col-4 col-sm-3">Abilities</dt>
              <dd className="col-8 col-sm-9 mb-0">
                <ul className="list-inline mb-0">
                  {pokemon.abilities.map((entry) => (
                    <li className="list-inline-item" key={entry.slot}>
                      <span className="badge rounded-pill text-bg-secondary fw-medium">
                        {humanize(entry.ability.name)}
                        {entry.is_hidden && ' (hidden)'}
                      </span>
                    </li>
                  ))}
                </ul>
              </dd>
            </dl>
          </div>
        </div>

        <hr className="my-4" />

        <section aria-labelledby="stats-heading">
          <h3 id="stats-heading" className="h5 mb-3">
            Base stats
          </h3>
          <StatBars stats={pokemon.stats} />
        </section>

        <hr className="my-4" />

        <section aria-labelledby="matchups-heading">
          <h3 id="matchups-heading" className="h5 mb-3">
            Type matchups
          </h3>
          <TypeMatchups types={pokemon.types} />
        </section>

        <hr className="my-4" />

        <section aria-labelledby="evolution-heading">
          <h3 id="evolution-heading" className="h5 mb-3">
            Evolution line
          </h3>
          {species ? (
            <EvolutionChain
              species={species}
              currentSpeciesName={pokemon.species.name}
              onSelect={onSelectSpecies}
            />
          ) : (
            <StatusMessage kind="loading">Loading evolution line…</StatusMessage>
          )}
        </section>
      </div>
    </article>
  )
}
