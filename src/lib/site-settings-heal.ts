import { prisma } from './db'

// Ajoute les colonnes récentes de site_settings si elles manquent
// (la table initiale ne les avait pas → Prisma plante en relisant la ligne).
let _healed = false

async function columnExists(table: string, column: string): Promise<boolean> {
  try {
    const rows = await prisma.$queryRawUnsafe<Array<{ c: bigint | number }>>(
      'SELECT COUNT(*) AS c FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = ? AND column_name = ?',
      table, column,
    )
    return Number(rows?.[0]?.c ?? 0) > 0
  } catch {
    return true
  }
}

export async function ensureSiteSettingsSchema(): Promise<void> {
  if (_healed) return
  try {
    const cols: Array<[string, string]> = [
      ['announcementEnabled', 'BOOLEAN NOT NULL DEFAULT false'],
      ['announcementText',    'TEXT NULL'],
      ['homeHeroTitle',       'VARCHAR(191) NULL'],
      ['homeHeroSubtitle',    'TEXT NULL'],
    ]
    for (const [name, def] of cols) {
      if (!(await columnExists('site_settings', name))) {
        await prisma.$executeRawUnsafe('ALTER TABLE `site_settings` ADD COLUMN `' + name + '` ' + def)
      }
    }
    _healed = true
  } catch (e) {
    console.error('[ensureSiteSettingsSchema]', e)
  }
}
