import { formatStatName } from '../lib/format'
import type { PokemonStat } from '../types/pokeapi'

/** The highest base stat in the games (Blissey's HP), used to scale every bar. */
const MAX_BASE_STAT = 255

function barColor(value: number): string {
  if (value < 50) return 'bg-danger'
  if (value < 80) return 'bg-warning'
  if (value < 110) return 'bg-success'
  return 'bg-primary'
}

export function StatBars({ stats }: { stats: PokemonStat[] }) {
  const total = stats.reduce((sum, stat) => sum + stat.base_stat, 0)

  return (
    <dl className="stat-list mb-0">
      {stats.map(({ stat, base_stat }) => {
        const label = formatStatName(stat.name)
        return (
          <div className="stat-row" key={stat.name}>
            <dt>{label}</dt>
            <dd className="stat-value">{base_stat}</dd>
            <dd>
              <div
                className="progress"
                // Bootstrap's progress component is div-based; a native <progress> cannot take its styling.
                // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role
                role="progressbar"
                aria-label={label}
                aria-valuenow={base_stat}
                aria-valuemin={0}
                aria-valuemax={MAX_BASE_STAT}
              >
                <div
                  className={`progress-bar ${barColor(base_stat)}`}
                  style={{ width: `${(base_stat / MAX_BASE_STAT) * 100}%` }}
                />
              </div>
            </dd>
          </div>
        )
      })}
      <div className="stat-row stat-row--total">
        <dt>Total</dt>
        <dd className="stat-value">{total}</dd>
        <dd />
      </div>
    </dl>
  )
}
