-- ============================================================
--  Voilectia S2 — Configuration serveur flexible
--  À coller dans phpMyAdmin (base u665516121_voilectia → onglet SQL)
--  Réexécutable sans danger (IF NOT EXISTS / INSERT ... ON DUPLICATE KEY).
-- ============================================================

-- 1) Tables flexibles (groupes + lignes de configuration) -----
CREATE TABLE IF NOT EXISTS `server_config_groups` (
  `id`        VARCHAR(191) NOT NULL,
  `title`     VARCHAR(191) NOT NULL,
  `icon`      VARCHAR(191) NULL,
  `order`     INT NOT NULL DEFAULT 0,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `server_config_items` (
  `id`          VARCHAR(191) NOT NULL,
  `groupId`     VARCHAR(191) NOT NULL,
  `label`       VARCHAR(191) NOT NULL,
  `value`       VARCHAR(191) NOT NULL,
  `description` TEXT NULL,
  `icon`        VARCHAR(191) NULL,
  `order`       INT NOT NULL DEFAULT 0,
  `isPublic`    BOOLEAN NOT NULL DEFAULT TRUE,
  `createdAt`   DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt`   DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX `server_config_items_groupId_idx` (`groupId`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 2) Nouvelles colonnes sur server_config ---------------------
--    (si « Duplicate column name » : la colonne existe déjà, ignore la ligne)
ALTER TABLE `server_config` ADD COLUMN `status`        VARCHAR(191) NOT NULL DEFAULT 'preparation';
ALTER TABLE `server_config` ADD COLUMN `ecoVersion`    VARCHAR(191) NULL;
ALTER TABLE `server_config` ADD COLUMN `discordUrl`    VARCHAR(191) NULL;
ALTER TABLE `server_config` ADD COLUMN `topServeurUrl` VARCHAR(191) NULL;

-- 3) Champs structurés Voilectia S2 ---------------------------
INSERT INTO `server_config`
  (`id`, `worldSize`, `difficulty`, `xpRate`, `specialties`, `currency`, `season`, `status`,
   `serverIp`, `serverPort`, `ecoVersion`, `modpack`, `updatedAt`)
VALUES
  ('singleton', '2.56 km²', 'Haute collaboration', 'Progression semi-lente', 6, 'VLC', 'S2', 'preparation',
   'play.voilectia.fr', '3003', '0.13.x', 'Voilectia S2', NOW(3))
ON DUPLICATE KEY UPDATE
  `currency`='VLC', `season`='S2', `status`='preparation',
  `serverIp`='play.voilectia.fr', `serverPort`='3003',
  `ecoVersion`='0.13.x', `modpack`='Voilectia S2', `updatedAt`=NOW(3);

-- 4) Groupes --------------------------------------------------
INSERT INTO `server_config_groups` (`id`,`title`,`icon`,`order`,`updatedAt`) VALUES
  ('scg_monde',       'Monde',       '🌍', 1, NOW(3)),
  ('scg_progression', 'Progression', '⚙️', 2, NOW(3)),
  ('scg_economie',    'Économie',    '💰', 3, NOW(3)),
  ('scg_gameplay',    'Gameplay',    '🌾', 4, NOW(3))
ON DUPLICATE KEY UPDATE `title`=VALUES(`title`), `icon`=VALUES(`icon`), `order`=VALUES(`order`);

-- 5) Lignes de configuration ----------------------------------
INSERT INTO `server_config_items`
  (`id`,`groupId`,`label`,`value`,`description`,`icon`,`order`,`isPublic`,`updatedAt`) VALUES
  -- Monde
  ('sci_taille',      'scg_monde',       'Taille du monde', '2.56 km²',      NULL, '🗺️', 1, TRUE, NOW(3)),
  ('sci_dimensions',  'scg_monde',       'Dimensions',      '160 x 160',     NULL, '📐', 2, TRUE, NOW(3)),
  ('sci_meteorite',   'scg_monde',       'Météorite',       '30 jours',      'Chute de la météorite après 30 jours', '☄️', 3, TRUE, NOW(3)),
  -- Progression
  ('sci_difficulte',  'scg_progression', 'Difficulté',      'Haute collaboration', 'Aucun joueur ne progresse seul', '🤝', 1, TRUE, NOW(3)),
  ('sci_xp',          'scg_progression', 'XP',              'Progression semi-lente', 'Pensée pour limiter le rush', '🐢', 2, TRUE, NOW(3)),
  ('sci_xpglobale',   'scg_progression', 'XP globale',      'Ralentissement V13', NULL, '🌐', 3, TRUE, NOW(3)),
  ('sci_xpmetiers',   'scg_progression', 'XP métiers',      'Ralentie',      NULL, '🛠️', 4, TRUE, NOW(3)),
  ('sci_etoiles',     'scg_progression', 'Coût des étoiles','Vanilla',       NULL, '⭐', 5, TRUE, NOW(3)),
  ('sci_metiers',     'scg_progression', 'Métiers max',     '4',             NULL, '🛠️', 6, TRUE, NOW(3)),
  ('sci_spe',         'scg_progression', 'Spécialisations max', '6',         NULL, '🎯', 7, TRUE, NOW(3)),
  -- Économie
  ('sci_monnaie',     'scg_economie',    'Monnaie',         'VLC',           NULL, '🪙', 1, TRUE, NOW(3)),
  ('sci_depart',      'scg_economie',    'Argent de départ','10 000 VLC',    NULL, '💵', 2, TRUE, NOW(3)),
  ('sci_eco',         'scg_economie',    'Économie',        'Ecognome',      NULL, '🏪', 3, TRUE, NOW(3)),
  ('sci_prixmin',     'scg_economie',    'Prix minimums',   'Activés',       NULL, '🔒', 4, TRUE, NOW(3)),
  -- Gameplay
  ('sci_agri',        'scg_gameplay',    'Agriculture',     '+25 % croissance', NULL, '🌱', 1, TRUE, NOW(3)),
  ('sci_housing',     'scg_gameplay',    'Housing',         'Important',     NULL, '🏠', 2, TRUE, NOW(3)),
  ('sci_cuisine',     'scg_gameplay',    'Cuisine',         'Revalorisée',   NULL, '🍳', 3, TRUE, NOW(3)),
  ('sci_rush',        'scg_gameplay',    'Rush',            'Limité',        NULL, '🚫', 4, TRUE, NOW(3))
ON DUPLICATE KEY UPDATE
  `label`=VALUES(`label`), `value`=VALUES(`value`), `description`=VALUES(`description`),
  `icon`=VALUES(`icon`), `order`=VALUES(`order`), `isPublic`=VALUES(`isPublic`);

-- Terminé. Recharge /configuration pour voir le résultat.
