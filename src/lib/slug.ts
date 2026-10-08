/**
 * Turn whatever a person typed ("Mr. Mime", "Flabébé", "Nidoran♀", " #025 ") into the
 * lowercase, hyphenated identifier PokéAPI expects ("mr-mime", "flabebe", "nidoran-f", "25").
 */
export function toSlug(input: string): string {
  const slug = input
    .normalize('NFKD')
    // Drop the combining marks NFKD split off, so "é" becomes "e".
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/♀/g, '-f')
    .replace(/♂/g, '-m')
    // Punctuation that PokéAPI simply omits: "farfetch'd" → "farfetchd", "#25" → "25".
    .replace(/['’#]/g, '')
    // Everything else that is not a letter or digit becomes a single hyphen, so both "Mr. Mime"
    // and "Mr.Mime" become "mr-mime" and "Mime Jr." becomes "mime-jr".
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  // National Dex numbers are often written zero-padded ("025"); the API wants "25".
  return /^\d+$/.test(slug) ? String(Number.parseInt(slug, 10)) : slug
}
