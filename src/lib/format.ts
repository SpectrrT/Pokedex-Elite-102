import type { PokemonSpecies } from '../types/pokeapi'

/** Species whose display names contain punctuation or symbols that a slug cannot carry. */
const SPECIAL_NAMES: Record<string, string> = {
  'mr-mime': 'Mr. Mime',
  'mime-jr': 'Mime Jr.',
  'mr-rime': 'Mr. Rime',
  'nidoran-f': 'Nidoran♀',
  'nidoran-m': 'Nidoran♂',
  farfetchd: "Farfetch'd",
  sirfetchd: "Sirfetch'd",
  'ho-oh': 'Ho-Oh',
  'porygon-z': 'Porygon-Z',
  'type-null': 'Type: Null',
  'jangmo-o': 'Jangmo-o',
  'hakamo-o': 'Hakamo-o',
  'kommo-o': 'Kommo-o',
  flabebe: 'Flabébé',
  'wo-chien': 'Wo-Chien',
  'chien-pao': 'Chien-Pao',
  'ting-lu': 'Ting-Lu',
  'chi-yu': 'Chi-Yu',
}

const STAT_LABELS: Record<string, string> = {
  hp: 'HP',
  attack: 'Attack',
  defense: 'Defense',
  'special-attack': 'Sp. Atk',
  'special-defense': 'Sp. Def',
  speed: 'Speed',
}

export const capitalize = (word: string): string => word.charAt(0).toUpperCase() + word.slice(1)

/** "special-attack" → "Special Attack" */
export function humanize(slug: string): string {
  return slug.split('-').filter(Boolean).map(capitalize).join(' ')
}

/** Display name for a species slug, honouring the Pokémon with punctuation in their names. */
export function formatSpeciesName(slug: string): string {
  return SPECIAL_NAMES[slug] ?? humanize(slug)
}

/**
 * Display name for a concrete form. "deoxys-attack" belonging to species "deoxys" renders as
 * "Deoxys (Attack)"; a form whose name equals its species renders as the species name.
 */
export function formatPokemonName(pokemonName: string, speciesName: string = pokemonName): string {
  if (pokemonName === speciesName) return formatSpeciesName(speciesName)
  const prefix = `${speciesName}-`
  if (pokemonName.startsWith(prefix)) {
    return `${formatSpeciesName(speciesName)} (${humanize(pokemonName.slice(prefix.length))})`
  }
  return formatSpeciesName(pokemonName)
}

export const formatDexNumber = (id: number): string => `#${String(id).padStart(4, '0')}`

export const formatHeight = (decimetres: number): string => `${(decimetres / 10).toFixed(1)} m`

export const formatWeight = (hectograms: number): string => `${(hectograms / 10).toFixed(1)} kg`

export const formatStatName = (slug: string): string => STAT_LABELS[slug] ?? humanize(slug)

/** Flavor text arrives with the form feeds, soft hyphens and hard line breaks of the games' text boxes. */
export function cleanFlavorText(text: string): string {
  return text
    .replace(/­\n/g, '')
    .replace(/[\f\n\r]+/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/POKéMON/g, 'Pokémon')
    .trim()
}

/** The most recent English Pokédex entry, or null when the species has none. */
export function englishFlavorText(species: PokemonSpecies): string | null {
  const entries = species.flavor_text_entries.filter((entry) => entry.language.name === 'en')
  const latest = entries.at(-1)
  return latest ? cleanFlavorText(latest.flavor_text) : null
}

/** "Mouse Pokémon", "Seed Pokémon", … */
export function englishGenus(species: PokemonSpecies): string | null {
  return species.genera.find((genus) => genus.language.name === 'en')?.genus ?? null
}
