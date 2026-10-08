import { useCallback } from 'react'
import { EmptyState } from './components/EmptyState'
import { ErrorBoundary } from './components/ErrorBoundary'
import { Pokeball } from './components/Pokeball'
import { PokemonDetails } from './components/PokemonDetails'
import { SearchBar } from './components/SearchBar'
import { ThemeToggle } from './components/ThemeToggle'
import { useSpeciesCount } from './hooks/usePokeApi'
import { useSearchParam } from './hooks/useSearchParam'
import { useTheme } from './hooks/useTheme'
import { randomPokemonId } from './lib/api'
import { toSlug } from './lib/slug'

export default function App() {
  const [query, setQuery] = useSearchParam('pokemon')
  const speciesCount = useSpeciesCount()
  const [theme, toggleTheme] = useTheme()

  const showRandom = useCallback(() => {
    setQuery(String(randomPokemonId(speciesCount)))
  }, [setQuery, speciesCount])

  const showPokemon = useCallback(
    (name: string) => {
      // Re-selecting what is already on screen ("Pikachu" after "pikachu", or the highlighted
      // evolution stage) replaces the history entry instead of stacking a duplicate that would
      // make Back appear to do nothing.
      setQuery(name, { replace: toSlug(name) === toSlug(query) })
    },
    [query, setQuery],
  )

  return (
    <div className="app d-flex flex-column min-vh-100">
      <header className="app-header">
        <div className="container d-flex align-items-center justify-content-between py-3">
          <h1 className="mb-0 lh-1">
            <a
              href={import.meta.env.BASE_URL}
              className="app-brand"
              onClick={(event) => {
                event.preventDefault()
                setQuery(null)
              }}
            >
              <Pokeball />
              <span>Pokédex</span>
            </a>
          </h1>
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </div>
      </header>

      <main className="container flex-grow-1 py-4">
        <SearchBar
          currentQuery={query}
          pokemonCount={speciesCount}
          onSearch={showPokemon}
          onRandom={showRandom}
        />
        <div className="mt-4">
          {query ? (
            <ErrorBoundary resetKey={query}>
              <PokemonDetails query={query} onSelectSpecies={showPokemon} />
            </ErrorBoundary>
          ) : (
            <EmptyState onPick={showPokemon} />
          )}
        </div>
      </main>

      <footer className="container py-4 small text-body-secondary">
        Pokémon data and artwork from <a href="https://pokeapi.co/">PokéAPI</a>. Pokémon and Pokémon
        character names are trademarks of Nintendo, Game Freak and The Pokémon Company.
      </footer>
    </div>
  )
}
