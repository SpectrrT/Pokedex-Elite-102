import { useCallback } from 'react'
import { EmptyState } from './components/EmptyState'
import { Pokeball } from './components/Pokeball'
import { PokemonDetails } from './components/PokemonDetails'
import { SearchBar } from './components/SearchBar'
import { ThemeToggle } from './components/ThemeToggle'
import { useSpeciesCount } from './hooks/usePokeApi'
import { useSearchParam } from './hooks/useSearchParam'
import { useTheme } from './hooks/useTheme'
import { randomPokemonId } from './lib/api'

export default function App() {
  const [query, setQuery] = useSearchParam('pokemon')
  const speciesCount = useSpeciesCount()
  const [theme, toggleTheme] = useTheme()

  const showRandom = useCallback(() => {
    setQuery(String(randomPokemonId(speciesCount)))
  }, [setQuery, speciesCount])

  const showPokemon = useCallback((name: string) => setQuery(name), [setQuery])

  return (
    <div className="app d-flex flex-column min-vh-100">
      <header className="app-header">
        <div className="container d-flex align-items-center justify-content-between py-3">
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
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </div>
      </header>

      <main className="container flex-grow-1 py-4">
        <SearchBar currentQuery={query} onSearch={showPokemon} onRandom={showRandom} />
        <div className="mt-4">
          {query ? (
            <PokemonDetails query={query} onSelectSpecies={showPokemon} />
          ) : (
            <EmptyState onPick={showPokemon} />
          )}
        </div>
      </main>

      <footer className="container py-4 small text-body-secondary">
        Pokémon data and artwork from{' '}
        <a href="https://pokeapi.co/" rel="noopener noreferrer" target="_blank">
          PokéAPI
        </a>
        . Pokémon and Pokémon character names are trademarks of Nintendo, Game Freak and The Pokémon
        Company.
      </footer>
    </div>
  )
}
