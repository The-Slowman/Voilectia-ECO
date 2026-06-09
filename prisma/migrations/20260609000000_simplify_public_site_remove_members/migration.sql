-- Migration : simplification en site vitrine/wiki
-- ------------------------------------------------------------------
--  Suppression du système membre/joueur, forum, messagerie,
--  suggestions, sondages, recrutement, métiers & rangs in-game,
--  messages de contact.
--  Conserve : admin (User+AdminSession+Rank), contenu, config serveur.
-- ------------------------------------------------------------------

SET FOREIGN_KEY_CHECKS = 0;

-- ── Tables communauté / forum ────────────────────────────────
DROP TABLE IF EXISTS `forum_reactions`;
DROP TABLE IF EXISTS `forum_reports`;
DROP TABLE IF EXISTS `forum_comments`;
DROP TABLE IF EXISTS `forum_posts`;
DROP TABLE IF EXISTS `forum_categories`;
DROP TABLE IF EXISTS `suggestion_votes`;
DROP TABLE IF EXISTS `suggestions`;
DROP TABLE IF EXISTS `survey_answers`;
DROP TABLE IF EXISTS `survey_questions`;
DROP TABLE IF EXISTS `surveys`;
DROP TABLE IF EXISTS `recruitment_applications`;
DROP TABLE IF EXISTS `recruitment_posts`;
DROP TABLE IF EXISTS `direct_messages`;
DROP TABLE IF EXISTS `channel_messages`;
DROP TABLE IF EXISTS `channels`;
DROP TABLE IF EXISTS `contact_messages`;

-- ── FK joueur sur users (avant drop des tables référencées) ──
ALTER TABLE `users` DROP FOREIGN KEY `users_jobId_fkey`;
ALTER TABLE `users` DROP FOREIGN KEY `users_playerRankId_fkey`;

DROP TABLE IF EXISTS `jobs`;
DROP TABLE IF EXISTS `player_ranks`;

-- ── Suppression des comptes joueurs ──────────────────────────
DELETE FROM `users` WHERE `role` = 'PLAYER';

-- ── Nettoyage des colonnes joueur sur users ──────────────────
DROP INDEX `users_playerToken_key` ON `users`;
ALTER TABLE `users`
  DROP COLUMN `discordTag`,
  DROP COLUMN `ecoName`,
  DROP COLUMN `bio`,
  DROP COLUMN `jobId`,
  DROP COLUMN `playerRankId`,
  DROP COLUMN `playerToken`,
  DROP COLUMN `banned`;

-- ── Permissions de rangs liées aux modules supprimés ─────────
ALTER TABLE `ranks`
  DROP COLUMN `canManageForum`,
  DROP COLUMN `canManageSurveys`,
  DROP COLUMN `canManageRecruitment`;

SET FOREIGN_KEY_CHECKS = 1;
