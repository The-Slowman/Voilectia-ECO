import { prisma } from './db'

// Filet de sécurité : crée les tables/colonnes de configuration si elles n'existent
// pas encore (utile quand la migration SQL n'a pas été appliquée sur l'hébergement).
let _healed = false

async function columnExists(table: string, column: string): Promise<boolean> {
  try {
    const rows = await prisma.$queryRawUnsafe<Array<{ c: bigint | number }>>(
      'SELECT COUNT(*) AS c FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = ? AND column_name = ?',
      table, column,
    )
    return Number(rows?.[0]?.c ?? 0) > 0
  } catch {
    return true // en cas de doute, ne pas tenter d'ALTER
  }
}

export async function ensureServerConfigSchema(): Promise<void> {
  if (_healed) return
  try {
    await prisma.$executeRawUnsafe(
      'CREATE TABLE IF NOT EXISTS `server_config_groups` (' +
        '`id` VARCHAR(191) NOT NULL,' +
        '`title` VARCHAR(191) NOT NULL,' +
        '`icon` VARCHAR(191) NULL,' +
        '`order` INT NOT NULL DEFAULT 0,' +
        '`createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),' +
        '`updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),' +
        'PRIMARY KEY (`id`)' +
      ') DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci',
    )
    await prisma.$executeRawUnsafe(
      'CREATE TABLE IF NOT EXISTS `server_config_items` (' +
        '`id` VARCHAR(191) NOT NULL,' +
        '`groupId` VARCHAR(191) NOT NULL,' +
        '`label` VARCHAR(191) NOT NULL,' +
        '`value` VARCHAR(191) NOT NULL,' +
        '`description` TEXT NULL,' +
        '`icon` VARCHAR(191) NULL,' +
        '`order` INT NOT NULL DEFAULT 0,' +
        '`isPublic` BOOLEAN NOT NULL DEFAULT TRUE,' +
        '`createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),' +
        '`updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),' +
        'INDEX `server_config_items_groupId_idx` (`groupId`),' +
        'PRIMARY KEY (`id`)' +
      ') DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci',
    )
    const cols: Array<[string, string]> = [
      ['status',        "VARCHAR(191) NOT NULL DEFAULT 'preparation'"],
      ['ecoVersion',    'VARCHAR(191) NULL'],
      ['discordUrl',    'VARCHAR(191) NULL'],
      ['topServeurUrl', 'VARCHAR(191) NULL'],
    ]
    for (const [name, def] of cols) {
      if (!(await columnExists('server_config', name))) {
        await prisma.$executeRawUnsafe('ALTER TABLE `server_config` ADD COLUMN `' + name + '` ' + def)
      }
    }
    _healed = true
  } catch (e) {
    console.error('[ensureServerConfigSchema]', e)
  }
}
