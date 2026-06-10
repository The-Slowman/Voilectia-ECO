import { prisma } from './db'

export interface GuideCat { id: string; slug: string; name: string; icon: string | null; order: number }

const DEFAULTS = [
  { slug: 'debutant', name: 'Débutant', icon: '🌱', order: 1 },
  { slug: 'metier',   name: 'Métiers',  icon: '⚒️', order: 2 },
  { slug: 'economie', name: 'Économie', icon: '💰', order: 3 },
  { slug: 'ecoGnome', name: 'EcoGnome', icon: '🏪', order: 4 },
  { slug: 'ville',    name: 'Villes',   icon: '🏙️', order: 5 },
]

let _ensured = false
export async function ensureGuideCategoryTable(): Promise<void> {
  if (_ensured) return
  try {
    await prisma.$executeRawUnsafe(
      'CREATE TABLE IF NOT EXISTS `guide_categories` (' +
        '`id` VARCHAR(191) NOT NULL,' +
        '`slug` VARCHAR(191) NOT NULL,' +
        '`name` VARCHAR(191) NOT NULL,' +
        '`icon` VARCHAR(191) NULL,' +
        '`order` INT NOT NULL DEFAULT 0,' +
        '`createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),' +
        '`updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),' +
        'UNIQUE INDEX `guide_categories_slug_key` (`slug`),' +
        'PRIMARY KEY (`id`)' +
      ') DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci',
    )
    _ensured = true
  } catch (e) {
    console.error('[ensureGuideCategoryTable]', e)
  }
}

// Lit les categories ; cree la table + seed les valeurs par defaut si vide.
export async function getGuideCategories(): Promise<GuideCat[]> {
  try {
    await ensureGuideCategoryTable()
    let cats = await prisma.guideCategory.findMany({ orderBy: { order: 'asc' } })
    if (cats.length === 0) {
      for (const d of DEFAULTS) {
        try { await prisma.guideCategory.create({ data: d }) } catch { /* ignore doublon */ }
      }
      cats = await prisma.guideCategory.findMany({ orderBy: { order: 'asc' } })
    }
    return cats
  } catch {
    return DEFAULTS.map((d, i) => ({ id: 'default-' + i, ...d }))
  }
}
