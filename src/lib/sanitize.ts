/**
 * Sanitisation côté serveur — supprime les balises HTML dangereuses
 * sans dépendance externe (DOMPurify est client-only).
 */

// Balises autorisées dans le contenu riche (Tiptap)
const ALLOWED_TAGS = new Set([
  'p', 'br', 'strong', 'em', 'u', 's', 'code', 'pre',
  'h1', 'h2', 'h3', 'h4', 'ul', 'ol', 'li',
  'a', 'img', 'blockquote', 'hr', 'span', 'div',
])

// Attributs autorisés par balise
const ALLOWED_ATTRS: Record<string, Set<string>> = {
  a:   new Set(['href', 'target', 'rel']),
  img: new Set(['src', 'alt', 'width', 'height']),
  '*': new Set(['class', 'id']),
}

/**
 * Supprime les scripts inline et attributs dangereux d'une chaîne HTML.
 * Utilise des regex — pour une sécurité maximale en production,
 * utiliser DOMPurify côté client ou isomorphic-dompurify.
 */
export function sanitizeHtml(html: string): string {
  if (!html) return ''

  return html
    // Supprimer toutes les balises script
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Supprimer les gestionnaires d'événements (on*)
    .replace(/\s+on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/\s+on\w+\s*=\s*[^\s>]*/gi, '')
    // Supprimer javascript: dans les href/src
    .replace(/href\s*=\s*["']\s*javascript:[^"']*["']/gi, 'href="#"')
    .replace(/src\s*=\s*["']\s*javascript:[^"']*["']/gi, 'src=""')
    // Supprimer les balises meta, link, iframe, object, embed
    .replace(/<(meta|link|iframe|object|embed|form|input|button)[^>]*>/gi, '')
    // Supprimer les commentaires HTML
    .replace(/<!--[\s\S]*?-->/g, '')
}

/**
 * Sanitise une chaîne simple (pas de HTML autorisé).
 * Échappe les caractères spéciaux.
 */
export function sanitizeText(str: string): string {
  return str
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;')
    .replace(/'/g,  '&#x27;')
    .trim()
}

/**
 * Valide et nettoie un slug.
 */
export function sanitizeSlug(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
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
