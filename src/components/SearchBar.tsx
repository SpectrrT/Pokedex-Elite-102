import { useState, type FormEvent } from 'react'

interface SearchBarProps {
  /** The query currently shown, so the box follows navigation (evolution clicks, Back/Forward). */
  currentQuery: string
  /** How many Pokémon the Random button can land on. */
  pokemonCount: number
  onSearch: (query: string) => void
  onRandom: () => void
}

export function SearchBar({ currentQuery, pokemonCount, onSearch, onRandom }: SearchBarProps) {
  const [value, setValue] = useState(currentQuery)
  const [syncedQuery, setSyncedQuery] = useState(currentQuery)

  // Adopt the active query whenever it changes from outside, without clobbering in-progress typing
  // on unrelated re-renders. See https://react.dev/reference/react/useState#storing-information-from-previous-renders
  if (currentQuery !== syncedQuery) {
    setSyncedQuery(currentQuery)
    setValue(currentQuery)
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = value.trim()
    if (trimmed) onSearch(trimmed)
  }

  return (
    <search>
      <form className="search-bar d-flex flex-column flex-sm-row gap-2" onSubmit={handleSubmit}>
        <label htmlFor="pokemon-search" className="visually-hidden">
          Pokémon name or number
        </label>
        <input
          id="pokemon-search"
          className="form-control form-control-lg"
          type="search"
          name="pokemon"
          placeholder="Search by name or National Dex number…"
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
        <div className="d-flex gap-2">
          <button type="submit" className="btn btn-danger btn-lg flex-fill text-nowrap">
            Search
          </button>
          <button
            type="button"
            className="btn btn-outline-secondary btn-lg flex-fill text-nowrap"
            title={`Show one of ${pokemonCount.toLocaleString('en-US')} Pokémon at random`}
            onClick={onRandom}
          >
            Random
          </button>
        </div>
      </form>
    </search>
  )
}
