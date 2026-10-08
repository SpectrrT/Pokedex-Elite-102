import { usePokemon, useSpecies } from '../hooks/usePokeApi'
import { NotFoundError } from '../lib/api'
import { PokemonCard } from './PokemonCard'
import { StatusMessage } from './StatusMessage'

interface PokemonDetailsProps {
  query: string
  onSelectSpecies: (speciesName: string) => void
}

/** Loads the Pokémon for a query and renders the matching loading, error or detail view. */
export function PokemonDetails({ query, onSelectSpecies }: PokemonDetailsProps) {
  const { data: pokemon, error, isLoading } = usePokemon(query)
  const { data: species } = useSpecies(pokemon?.species.url)

  if (error instanceof NotFoundError) {
    return (
      <StatusMessage kind="warning" title="No Pokémon found">
        Nothing in the Pokédex matches “{query}”. Check the spelling, or try a National Dex number.
      </StatusMessage>
    )
  }

  if (error) {
    return (
      <StatusMessage kind="error" title="Something went wrong">
        PokéAPI didn't answer. Check your connection and try again.
      </StatusMessage>
    )
  }

  return (
    <div aria-busy={isLoading || undefined}>
      {isLoading && <StatusMessage kind="loading">Searching for “{query}”…</StatusMessage>}
      {pokemon && (
        <div className={isLoading ? 'mt-3 opacity-50' : undefined}>
          <PokemonCard pokemon={pokemon} species={species} onSelectSpecies={onSelectSpecies} />
        </div>
      )}
    </div>
  )
}
