# Pokédex

[![CI](https://github.com/SpectrrT/Pokedex-Elite-102/actions/workflows/ci.yml/badge.svg)](https://github.com/SpectrrT/Pokedex-Elite-102/actions/workflows/ci.yml)

A Pokédex built on [PokéAPI](https://pokeapi.co/). Search any Pokémon by name or National Dex
number, pull up a random one, and walk through its evolution line stage by stage.

I started this as a freshman in 2022 on Create React App. In 2026 it was rebuilt from the ground up
on a current toolchain, with the features the project set out to deliver actually implemented.

## Features

- **Search** by name or number. Input is forgiving: `Mr. Mime`, `Farfetch'd`, `Flabébé`, `Nidoran♀`
  and `#025` all resolve. Species names such as `Deoxys` resolve to the default form.
- **Random Pokémon** from the full National Dex.
- **Details**: official artwork, types, the latest English Pokédex entry, height, weight, abilities
  (hidden abilities marked) and base stats.
- **Type matchups** computed from the live type chart, including dual-type stacking: weaknesses
  with their multipliers (4×, 2×), resistances, immunities and the types the Pokémon hits hard.
- **Evolution line** rendered as a tree, so branching families like Eevee display correctly. Every
  stage is clickable and each step explains how it happens ("Use Thunder Stone",
  "Level up with high friendship at night").
- **Shareable URLs** (`?pokemon=raichu`) and working Back/Forward through everything you viewed.
- **Light and dark mode**, following the system preference until you pick one.
- Built to be accessible: landmarks, labelled controls, live regions, keyboard-operable evolution
  tree, reduced-motion support.

## Tech stack

| Area       | Choice                                                                 |
| ---------- | ---------------------------------------------------------------------- |
| UI         | [React 19](https://react.dev/) with TypeScript 7                       |
| Build      | [Vite 8](https://vite.dev/)                                            |
| Data       | [SWR 2](https://swr.vercel.app/) over the PokéAPI `fetch` calls        |
| Styling    | [Bootstrap 5.3](https://getbootstrap.com/) CSS plus a small stylesheet |
| Tests      | [Vitest 5](https://vitest.dev/) with Testing Library and jsdom         |
| Quality    | [oxlint](https://oxc.rs/) and [Prettier](https://prettier.io/)         |
| Automation | GitHub Actions CI and Dependabot                                       |

## Getting started

Requires Node.js 22.13+ or 24+ (the repo's `.nvmrc` selects Node 24).

```bash
npm install
npm run dev
```

Then open the URL Vite prints (normally <http://localhost:5173>).

### Scripts

| Command                 | What it does                                             |
| ----------------------- | -------------------------------------------------------- |
| `npm run dev`           | Start the dev server with hot module replacement         |
| `npm run build`         | Type-check, then build the production bundle into `dist` |
| `npm run preview`       | Serve the production build locally                       |
| `npm test`              | Run the test suite once                                  |
| `npm run test:watch`    | Run tests in watch mode                                  |
| `npm run test:coverage` | Run tests with a V8 coverage report                      |
| `npm run lint`          | Lint with oxlint                                         |
| `npm run typecheck`     | Type-check every project with `tsc -b`                   |
| `npm run format`        | Format the codebase with Prettier                        |
| `npm run check`         | Lint, type-check, format-check and test, as CI does      |

## Project structure

```
src/
├── App.tsx                 Layout, header, search and routing between empty/detail views
├── main.tsx                Entry point; mounts React and the global SWR configuration
├── components/             Presentational and data-bound UI pieces
│   ├── SearchBar.tsx       Search box with Search and Random actions
│   ├── PokemonDetails.tsx  Resolves a query to a Pokémon and picks loading/error/detail views
│   ├── PokemonCard.tsx     Artwork, entry text, abilities, stats, matchups, evolution line
│   ├── TypeMatchups.tsx    Weak to / strong against / resists / immune to
│   ├── EvolutionChain.tsx  Recursive evolution tree with clickable stages
│   └── …
├── hooks/
│   ├── usePokeApi.ts       SWR hooks for Pokémon, species, evolution chains and types
│   ├── useSearchParam.ts   `?pokemon=` kept in sync with browser history
│   └── useTheme.ts         Bootstrap colour mode with persistence
├── lib/
│   ├── api.ts              PokéAPI endpoints, error types and the species fallback lookup
│   ├── effectiveness.ts    Type-chart maths for single and dual types
│   ├── evolution.ts        Plain-English descriptions of evolution methods
│   ├── format.ts           Names, numbers, measurements and flavour text clean-up
│   ├── slug.ts             Turns whatever was typed into a PokéAPI identifier
│   └── swr.ts              Caching and retry policy
├── types/pokeapi.ts        The slice of PokéAPI v2 this app reads
└── test/                   Vitest setup, a fetch mock router and trimmed real API fixtures
```

## How it works

- **Lookup.** PokéAPI's `/pokemon` endpoint knows concrete forms ("deoxys-normal") while people type
  and evolution chains use species names ("deoxys"). The app tries `/pokemon/{query}` first and,
  on a 404, falls back to `/pokemon-species/{query}` and loads that species' default variety.
- **Type matchups.** For each of the 18 types, the damage multiplier against the Pokémon is the
  product of each of its types' `damage_relations`. Anything above 1× is a weakness, below 1× a
  resistance, 0× an immunity. "Strong against" is the union of the Pokémon's own types'
  `double_damage_to` lists.
- **Evolutions.** The species' `evolution_chain` is rendered recursively. Sprites come straight
  from the species id in each chain link, so the whole tree costs one request.
- **Caching.** PokéAPI data is static, so SWR keeps every response for the session and never
  revalidates in the background. A definitive "not found" is never retried; network errors are.

## Testing

Tests run against trimmed copies of real PokéAPI responses (see `src/test/fixtures`) through a
`fetch` mock, so they are deterministic and need no network. They cover the lookup fallback, the
type-chart maths, evolution descriptions, URL state, theme switching and the full search → details
→ evolution navigation flow.

```bash
npm test
```

## Credits

Pokémon data and artwork are served by [PokéAPI](https://pokeapi.co/) and the
[PokéAPI sprites](https://github.com/PokeAPI/sprites) project. Pokémon and Pokémon character names
are trademarks of Nintendo, Game Freak and The Pokémon Company. This is a fan-made, non-commercial
project.
