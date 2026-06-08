/**
 * Sanitisation HTML — côté serveur uniquement.
 *
 * Utilise `sanitize-html` (allowlist stricte) pour nettoyer le contenu riche
 * produit par l'éditeur Tiptap avant tout rendu via dangerouslySetInnerHTML.
 *
 * ⚠️ Ce module ne doit être importé que dans du code serveur
 * (Server Components, route handlers). Ne pas l'importer dans un composant
 * 'use client' : `sanitize-html` dépend de modules Node.
 */
import sanitizeHtmlLib from 'sanitize-html'

// Balises autorisées dans le contenu riche (Tiptap)
const ALLOWED_TAGS = [
  'p', 'br', 'hr',
  'strong', 'b', 'em', 'i', 'u', 's', 'strike', 'del', 'mark', 'sub', 'sup',
  'code', 'pre',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li',
  'a', 'img',
  'blockquote', 'span', 'div',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
]

const SANITIZE_OPTIONS: sanitizeHtmlLib.IOptions = {
  allowedTags: ALLOWED_TAGS,
  allowedAttributes: {
    a:   ['href', 'target', 'rel'],
    img: ['src', 'alt', 'title', 'width', 'height'],
    '*': ['class'],
  },
  // Protocoles autorisés pour les liens et images
  allowedSchemes: ['http', 'https', 'mailto'],
  allowedSchemesByTag: {
    img: ['http', 'https'],
  },
  allowProtocolRelative: false,
  // Force rel="noopener noreferrer" + target sûr sur les liens externes
  transformTags: {
    a: sanitizeHtmlLib.simpleTransform('a', {
      rel: 'noopener noreferrer nofollow',
    }),
  },
  // Supprime totalement le contenu des balises dangereuses
  disallowedTagsMode: 'discard',
}

/**
 * Nettoie une chaîne HTML riche (issue de Tiptap) pour un rendu sûr.
 * Supprime scripts, handlers on*, iframes, styles inline et tout schéma
 * d'URL non autorisé (javascript:, data: sur les liens, etc.).
 */
export function sanitizeHtml(html: string | null | undefined): string {
  if (!html) return ''
  return sanitizeHtmlLib(html, SANITIZE_OPTIONS)
}

/**
 * Sanitise une chaîne simple : supprime TOUTE balise HTML.
 * À utiliser pour les titres, noms, champs courts.
 */
export function sanitizeText(str: string | null | undefined): string {
  if (!str) return ''
  return sanitizeHtmlLib(str, { allowedTags: [], allowedAttributes: {} }).trim()
}

/**
 * Valide et nettoie un slug : minuscules, sans accents, alphanumérique + tirets.
 */
export function sanitizeSlug(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // diacritiques
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 100)
}

/**
 * Valide une URL — accepte seulement http/https.
 */
export function isValidUrl(url: string): boolean {
  try {
    const u = new URL(url)
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch {
    return false
  }
}

/**
 * Valide un Steam ID 64 bits.
 */
export function isValidSteamId(steamId: string): boolean {
  return /^[0-9]{17}$/.test(steamId)
}
