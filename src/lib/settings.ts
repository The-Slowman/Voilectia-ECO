import { prisma } from './db'

/**
 * Accès centralisé aux paramètres du site + logique de maintenance.
 *
 * Lit directement la base (Server Components / route handlers) avec des valeurs
 * par défaut sûres : si la BDD est indisponible, le site reste accessible
 * (maintenance considérée comme inactive) plutôt que de tout casser.
 *
 * ⚠️ Ne pas importer dans le middleware (runtime Edge — Prisma indisponible).
 */

export interface MaintenanceStatus {
  active:  boolean
  allowed: string[]
}

// Mapping section admin → préfixes URL publics
const SECTION_PREFIXES: Record<string, string[]> = {
  'accueil':       ['/'],
  'presentation':  ['/presentation'],
  'forum':         ['/forum'],
  'tutoriels':     ['/tutoriels'],
  'guides':        ['/guides'],
  'changelog':     ['/changelog'],
  'faq':           ['/faq'],
  'top-serveur':   ['/top-serveur'],
  'sondage':       ['/sondage'],
  'recrutement':   ['/recrutement'],
  'giveaways':     ['/giveaways'],
  'suggestions':   ['/suggestions'],
  'evenements':    ['/evenements'],
  'staff':         ['/staff'],
  'reglement':     ['/reglement'],
  'economie':      ['/economie', '/serveur', '/progression'],
  'messagerie':    ['/messagerie'],
  'profil':        ['/profil'],
}

// Pages publiques toujours accessibles, même en maintenance
const ALWAYS_ALLOWED = [
  '/maintenance',
  '/connexion',
  '/inscription',
  '/federation',
  '/soutenir',
  '/contact',
  '/p/',
  '/actualites/',
]

/**
 * Récupère l'état de maintenance. Sûr par défaut (inactif) si la BDD échoue.
 */
export async function getMaintenanceStatus(): Promise<MaintenanceStatus> {
  try {
    const settings = await prisma.siteSettings.findUnique({
      where:  { id: 'singleton' },
      select: { maintenanceActive: true, allowedSections: true },
    })
    if (!settings) return { active: false, allowed: [] }

    const raw = settings.allowedSections
    const allowed = typeof raw === 'string'
      ? (JSON.parse(raw) as string[])
      : (Array.isArray(raw) ? raw : [])

    return { active: !!settings.maintenanceActive, allowed }
  } catch {
    return { active: false, allowed: [] }
  }
}

/**
 * Indique si un chemin public est accessible compte tenu des sections autorisées.
 */
export function isPathAllowedDuringMaintenance(pathname: string, allowed: string[]): boolean {
  const always = ALWAYS_ALLOWED.some(p =>
    p === '/' ? pathname === '/' : pathname.startsWith(p)
  )
  if (always) return true

  return allowed.some(section => {
    const prefixes = SECTION_PREFIXES[section]
    if (!prefixes) return false
    return prefixes.some(prefix =>
      prefix === '/' ? pathname === '/' : pathname.startsWith(prefix)
    )
  })
}
