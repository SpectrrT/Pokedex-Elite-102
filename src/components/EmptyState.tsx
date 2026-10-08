const SUGGESTIONS = ['Pikachu', 'Eevee', 'Charizard', 'Gengar', 'Mewtwo', 'Lucario']

export function EmptyState({ onPick }: { onPick: (name: string) => void }) {
  return (
    <div className="empty-state text-center py-5">
      <h2 className="h4 mb-2">Search for any Pokémon</h2>
      <p className="text-body-secondary mb-4">
        Type a name or National Dex number, hit Random, or start with one of these.
      </p>
      <div className="d-flex flex-wrap justify-content-center gap-2">
        {SUGGESTIONS.map((name) => (
          <button
            key={name}
            type="button"
            className="btn btn-outline-danger rounded-pill"
            onClick={() => onPick(name)}
          >
            {name}
          </button>
        ))}
      </div>
    </div>
  )
}
