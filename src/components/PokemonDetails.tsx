import type { ReactNode } from 'react'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { usePokemon, useSpecies } from '../hooks/usePokeApi'
import { NotFoundError } from '../lib/api'
import { formatPokemonName, nationalDexNumber } from '../lib/format'
import { PokemonCard } from './PokemonCard'
import { StatusMessage } from './StatusMessage'

interface PokemonDetailsProps {
  query: string
  onSelectSpecies: (speciesName: string) => void
}

/** Loads the Pokémon for a query and renders the matching loading, error or detail view. */
export function PokemonDetails({ query, onSelectSpecies }: PokemonDetailsProps) {
  const { data: pokemon, error, isLoading, isValidating } = usePokemon(query)
  const species = useSpecies(pokemon?.species.url)

  // Revisiting a query that failed before triggers a fresh request; show that as loading rather
  // than flashing the old error until the retry settles.
  const retrying = error !== undefined && isValidating
  const busy = isLoading || retrying
  const notFound = error instanceof NotFoundError && !retrying
  const failed = error !== undefined && !notFound && !retrying
  // With keepPreviousData, `pokemon` can be the previous result while the next one loads.
  const settled = !busy && error === undefined ? pokemon : undefined
  const settledName = settled ? formatPokemonName(settled.name, settled.species.name) : null

  useDocumentTitle(settledName ? `${settledName} – Pokédex` : 'Pokédex')

  let announcement = ''
  if (busy) announcement = `Searching for “${query}”…`
  else if (notFound) announcement = `No Pokémon found for “${query}”.`
  else if (settled && settledName) {
    announcement = `Showing ${settledName}, number ${nationalDexNumber(settled)}.`
  }

  let content: ReactNode
  if (notFound) {
    content = (
      <StatusMessage kind="warning" title="No Pokémon found">
        Nothing in the Pokédex matches “{query}”. Check the spelling, or try a National Dex number.
      </StatusMessage>
    )
  } else if (failed) {
    content = (
      <StatusMessage kind="error" title="Something went wrong">
        PokéAPI didn't answer. Check your connection and try again.
      </StatusMessage>
    )
  } else {
    content = (
      <div aria-busy={busy || undefined}>
        {busy && <StatusMessage kind="loading">Searching for “{query}”…</StatusMessage>}
        {pokemon && (
          <div className={busy ? 'mt-3 opacity-50' : undefined}>
            <PokemonCard
              pokemon={pokemon}
              species={species.data}
              speciesError={species.error}
              onSelectSpecies={onSelectSpecies}
            />
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      {/* One long-lived polite live region: screen readers announce text changes reliably, whereas
          status elements that appear already filled are often skipped. */}
      <output className="visually-hidden">{announcement}</output>
      {content}
    </>
  )
}
