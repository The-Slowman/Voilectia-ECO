import { prisma } from './db'

/**
 * Récupère les blocs de contenu d'une page.
 * Utilisé côté serveur dans les Server Components.
 * Retourne un objet { key: value } avec les valeurs de la DB.
 * Si une clé n'existe pas, elle est absente (utilise la valeur statique dans le composant).
 */
export async function getPageContent(page: string): Promise<Record<string, string>> {
  try {
    const blocks = await prisma.pageContent.findMany({ where: { page } })
    return Object.fromEntries(blocks.map(b => [b.key, b.value]))
  } catch {
    return {}
  }
}
