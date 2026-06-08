-- Migration : suppression du module Villes + sessions admin hashées
-- ------------------------------------------------------------------
--  1. Drop des tables city_*
--  2. Création de admin_sessions (tokens hashés + expiration)
--  3. Suppression de users.adminToken (remplacé par admin_sessions)
--  4. Suppression de ranks.canManageVilles
-- ------------------------------------------------------------------

-- ── 1. Suppression des tables Villes ─────────────────────────
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `city_vote_responses`;
DROP TABLE IF EXISTS `city_votes`;
DROP TABLE IF EXISTS `city_project_participants`;
DROP TABLE IF EXISTS `city_collaborations`;
DROP TABLE IF EXISTS `city_projects`;
DROP TABLE IF EXISTS `city_comments`;
DROP TABLE IF EXISTS `city_announcements`;
DROP TABLE IF EXISTS `city_memberships`;
DROP TABLE IF EXISTS `city_images`;
DROP TABLE IF EXISTS `cities`;
SET FOREIGN_KEY_CHECKS = 1;

-- ── 2. Sessions admin hashées ────────────────────────────────
CREATE TABLE `admin_sessions` (
    `id` VARCHAR(191) NOT NULL,
    `tokenHash` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `ipAddress` VARCHAR(191) NULL,
    `userAgent` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `expiresAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `admin_sessions_tokenHash_key`(`tokenHash`),
    INDEX `admin_sessions_userId_idx`(`userId`),
    INDEX `admin_sessions_expiresAt_idx`(`expiresAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `admin_sessions`
    ADD CONSTRAINT `admin_sessions_userId_fkey`
    FOREIGN KEY (`userId`) REFERENCES `users`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE;

-- ── 3. Suppression de users.adminToken ───────────────────────
-- (l'index unique est supprimé en même temps que la colonne)
DROP INDEX `users_adminToken_key` ON `users`;
ALTER TABLE `users` DROP COLUMN `adminToken`;

-- ── 4. Suppression de ranks.canManageVilles ──────────────────
ALTER TABLE `ranks` DROP COLUMN `canManageVilles`;
