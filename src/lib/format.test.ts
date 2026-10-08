// @vitest-environment node
import { describe, expect, it } from 'vitest'
import deoxysAttack from '../test/fixtures/pokemon-deoxys-attack.json'
import pikachu from '../test/fixtures/pokemon-pikachu.json'
import speciesPikachu from '../test/fixtures/species-pikachu.json'
import type { Pokemon, PokemonSpecies } from '../types/pokeapi'
import {
  cleanFlavorText,
  englishFlavorText,
  englishGenus,
  formatDexNumber,
  formatHeight,
  formatPokemonName,
  formatSpeciesName,
  formatStatName,
  formatWeight,
  humanize,
  nationalDexNumber,
} from './format'

describe('humanize', () => {
  it('capitalises each hyphenated word', () => {
    expect(humanize('special-attack')).toBe('Special Attack')
    expect(humanize('thunder-stone')).toBe('Thunder Stone')
    expect(humanize('hp')).toBe('Hp')
  })
})

describe('formatSpeciesName', () => {
  it('handles the species whose names carry punctuation', () => {
    expect(formatSpeciesName('mr-mime')).toBe('Mr. Mime')
    expect(formatSpeciesName('farfetchd')).toBe("Farfetch'd")
    expect(formatSpeciesName('nidoran-f')).toBe('Nidoran♀')
    expect(formatSpeciesName('type-null')).toBe('Type: Null')
    expect(formatSpeciesName('flabebe')).toBe('Flabébé')
  })

  it('falls back to humanising everything else', () => {
    expect(formatSpeciesName('pikachu')).toBe('Pikachu')
    expect(formatSpeciesName('tapu-koko')).toBe('Tapu Koko')
  })
})

describe('formatPokemonName', () => {
  it('shows a plain species name when the form is the species', () => {
    expect(formatPokemonName('pikachu', 'pikachu')).toBe('Pikachu')
    expect(formatPokemonName('pikachu')).toBe('Pikachu')
  })

  it('shows the form in parentheses after the species', () => {
    expect(formatPokemonName('deoxys-normal', 'deoxys')).toBe('Deoxys (Normal)')
    expect(formatPokemonName('giratina-altered', 'giratina')).toBe('Giratina (Altered)')
    expect(formatPokemonName('mr-mime-galar', 'mr-mime')).toBe('Mr. Mime (Galar)')
  })

  it('humanises a form that does not share its species prefix', () => {
    expect(formatPokemonName('something-odd', 'other')).toBe('Something Odd')
  })
})

describe('measurements', () => {
  it('formats dex numbers, height and weight', () => {
    expect(formatDexNumber(25)).toBe('#0025')
    expect(formatDexNumber(1025)).toBe('#1025')
    expect(nationalDexNumber(pikachu as Pokemon)).toBe(25)
    // Alternate forms have internal ids (10001+) but belong to a numbered species.
    expect(nationalDexNumber(deoxysAttack as Pokemon)).toBe(386)
    expect(formatHeight(4)).toBe('0.4 m')
    expect(formatHeight(17)).toBe('1.7 m')
    expect(formatWeight(60)).toBe('6.0 kg')
    expect(formatWeight(905)).toBe('90.5 kg')
  })

  it('labels stats the way the games do', () => {
    expect(formatStatName('hp')).toBe('HP')
    expect(formatStatName('special-attack')).toBe('Sp. Atk')
    expect(formatStatName('special-defense')).toBe('Sp. Def')
    expect(formatStatName('evasion')).toBe('Evasion')
  })
})

describe('flavor text', () => {
  it('strips the control characters from the games', () => {
    expect(
      cleanFlavorText('When several of\nthese POKéMON\ngather, their\felectricity could\nbuild.'),
    ).toBe('When several of these Pokémon gather, their electricity could build.')
    expect(cleanFlavorText('A soft­\nhyphen  and   spaces ')).toBe('A softhyphen and spaces')
  })

  it('picks the most recent English entry and the English genus', () => {
    const species = speciesPikachu as PokemonSpecies
    expect(englishFlavorText(species)).toBe(
      'Possesses cheek sacs in which it stores electricity. This clever forest-dweller roasts tough berries with an electric shock before consuming them.',
    )
    expect(englishGenus(species)).toBe('Mouse Pokémon')
  })

  it('returns null when a species has no English text', () => {
    const species = { ...speciesPikachu, flavor_text_entries: [], genera: [] } as PokemonSpecies
    expect(englishFlavorText(species)).toBeNull()
    expect(englishGenus(species)).toBeNull()
  })
})
