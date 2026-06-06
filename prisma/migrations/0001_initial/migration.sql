-- Migration initiale : création de toutes les tables Voilectia ECO
-- Générée depuis le schéma Prisma complet

CREATE TABLE IF NOT EXISTS `users` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` VARCHAR(191) NOT NULL DEFAULT 'EDITOR',
    `avatar` VARCHAR(191) NULL,
    `rankId` VARCHAR(191) NULL,
    `discordTag` VARCHAR(191) NULL,
    `ecoName` VARCHAR(191) NULL,
    `bio` TEXT NULL,
    `jobId` VARCHAR(191) NULL,
    `playerRankId` VARCHAR(191) NULL,
    `playerToken` VARCHAR(191) NULL,
    `adminToken` VARCHAR(191) NULL,
    `lastLoginAt` DATETIME(3) NULL,
    `banned` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    UNIQUE INDEX `users_playerToken_key`(`playerToken`),
    UNIQUE INDEX `users_adminToken_key`(`adminToken`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `ranks` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `color` VARCHAR(191) NOT NULL DEFAULT '#3A7A52',
    `badge` VARCHAR(191) NULL,
    `level` INTEGER NOT NULL DEFAULT 0,
    `canPublish` BOOLEAN NOT NULL DEFAULT false,
    `canManageArticles` BOOLEAN NOT NULL DEFAULT false,
    `canManageForum` BOOLEAN NOT NULL DEFAULT false,
    `canManageVilles` BOOLEAN NOT NULL DEFAULT false,
    `canManageStaff` BOOLEAN NOT NULL DEFAULT false,
    `canManageRecruitment` BOOLEAN NOT NULL DEFAULT false,
    `canManageSurveys` BOOLEAN NOT NULL DEFAULT false,
    `canManageRanks` BOOLEAN NOT NULL DEFAULT false,
    `canManageUsers` BOOLEAN NOT NULL DEFAULT false,
    `isStaff` BOOLEAN NOT NULL DEFAULT true,
    `order` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ranks_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `player_ranks` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `color` VARCHAR(191) NOT NULL DEFAULT '#D4A820',
    `badge` VARCHAR(191) NULL,
    `description` VARCHAR(191) NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `player_ranks_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `jobs` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `icon` VARCHAR(191) NULL,
    `color` VARCHAR(191) NOT NULL DEFAULT '#3A7A52',
    `order` INTEGER NOT NULL DEFAULT 0,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `jobs_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `direct_messages` (
    `id` VARCHAR(191) NOT NULL,
    `senderId` VARCHAR(191) NOT NULL,
    `receiverId` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `read` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `channels` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `icon` VARCHAR(191) NULL,
    `color` VARCHAR(191) NOT NULL DEFAULT '#3A7A52',
    `isPublic` BOOLEAN NOT NULL DEFAULT true,
    `order` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `channels_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `channel_messages` (
    `id` VARCHAR(191) NOT NULL,
    `channelId` VARCHAR(191) NOT NULL,
    `authorId` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `articles` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `excerpt` TEXT NULL,
    `content` TEXT NOT NULL,
    `coverImage` VARCHAR(191) NULL,
    `category` VARCHAR(191) NOT NULL DEFAULT 'news',
    `published` BOOLEAN NOT NULL DEFAULT false,
    `pinned` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `authorId` VARCHAR(191) NOT NULL,
    `metaTitle` VARCHAR(191) NULL,
    `metaDesc` VARCHAR(191) NULL,
    `ogImage` VARCHAR(191) NULL,

    UNIQUE INDEX `articles_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `changelogs` (
    `id` VARCHAR(191) NOT NULL,
    `version` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `season` VARCHAR(191) NOT NULL DEFAULT 'S1',
    `type` VARCHAR(191) NOT NULL DEFAULT 'update',
    `published` BOOLEAN NOT NULL DEFAULT false,
    `publishedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `authorId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `guides` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `excerpt` TEXT NULL,
    `content` TEXT NOT NULL,
    `category` VARCHAR(191) NOT NULL DEFAULT 'debutant',
    `coverImage` VARCHAR(191) NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `published` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `authorId` VARCHAR(191) NOT NULL,
    `metaTitle` VARCHAR(191) NULL,
    `metaDesc` VARCHAR(191) NULL,

    UNIQUE INDEX `guides_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `events` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `content` TEXT NULL,
    `coverImage` VARCHAR(191) NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NULL,
    `location` VARCHAR(191) NULL,
    `type` VARCHAR(191) NOT NULL DEFAULT 'community',
    `status` VARCHAR(191) NOT NULL DEFAULT 'upcoming',
    `published` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `authorId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `events_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `event_images` (
    `id` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `alt` VARCHAR(191) NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `eventId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `cities` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `mayor` VARCHAR(191) NOT NULL,
    `mayorEmail` VARCHAR(191) NULL,
    `population` INTEGER NULL,
    `biome` VARCHAR(191) NULL,
    `coverImage` VARCHAR(191) NULL,
    `bannerImage` VARCHAR(191) NULL,
    `coordinates` VARCHAR(191) NULL,
    `accentColor` VARCHAR(191) NULL,
    `motto` VARCHAR(191) NULL,
    `published` BOOLEAN NOT NULL DEFAULT false,
    `order` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `cities_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `city_images` (
    `id` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `alt` VARCHAR(191) NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `cityId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `staff_members` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `role` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `avatar` VARCHAR(191) NULL,
    `discordId` VARCHAR(191) NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `rules` (
    `id` VARCHAR(191) NOT NULL,
    `categoryId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `severity` VARCHAR(191) NOT NULL DEFAULT 'info',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `rule_categories` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `icon` VARCHAR(191) NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `faq_items` (
    `id` VARCHAR(191) NOT NULL,
    `question` VARCHAR(191) NOT NULL,
    `answer` VARCHAR(191) NOT NULL,
    `categoryId` VARCHAR(191) NOT NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `published` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `faq_categories` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `icon` VARCHAR(191) NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `medias` (
    `id` VARCHAR(191) NOT NULL,
    `filename` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `mimeType` VARCHAR(191) NOT NULL,
    `size` INTEGER NOT NULL,
    `alt` VARCHAR(191) NULL,
    `folder` VARCHAR(191) NOT NULL DEFAULT 'general',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `custom_pages` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `icon` VARCHAR(191) NULL,
    `showInNav` BOOLEAN NOT NULL DEFAULT false,
    `navSection` VARCHAR(191) NULL,
    `published` BOOLEAN NOT NULL DEFAULT false,
    `order` INTEGER NOT NULL DEFAULT 0,
    `metaTitle` VARCHAR(191) NULL,
    `metaDesc` VARCHAR(191) NULL,
    `ogImage` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `custom_pages_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `nav_items` (
    `id` VARCHAR(191) NOT NULL,
    `label` VARCHAR(191) NOT NULL,
    `href` VARCHAR(191) NOT NULL DEFAULT '',
    `icon` VARCHAR(191) NULL,
    `section` VARCHAR(191) NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `external` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `top_serveur_votes` (
    `id` VARCHAR(191) NOT NULL,
    `voterToken` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `site_settings` (
    `id` VARCHAR(191) NOT NULL DEFAULT 'singleton',
    `siteName` VARCHAR(191) NOT NULL DEFAULT 'Voilectia ECO',
    `siteDescription` VARCHAR(191) NULL,
    `discordUrl` VARCHAR(191) NULL,
    `serverIp` VARCHAR(191) NULL,
    `serverPort` VARCHAR(191) NULL,
    `tipeeeUrl` VARCHAR(191) NULL,
    `contactEmail` VARCHAR(191) NULL,
    `season` VARCHAR(191) NOT NULL DEFAULT 'S1',
    `maintenanceMode` BOOLEAN NOT NULL DEFAULT false,
    `heroTitle` VARCHAR(191) NULL,
    `heroSubtitle` VARCHAR(191) NULL,
    `ogImage` VARCHAR(191) NULL,
    `maintenanceActive` BOOLEAN NOT NULL DEFAULT false,
    `maintenanceTitle` VARCHAR(191) NOT NULL DEFAULT 'Saison 2 — Bientôt disponible',
    `maintenanceMessage` VARCHAR(191) NOT NULL DEFAULT 'Le serveur se prépare pour une nouvelle aventure.',
    `launchDate` DATETIME(3) NULL,
    `allowedSections` TEXT NOT NULL DEFAULT '["forum","tutoriels","top-serveur"]',
    `ecoMapEnabled` BOOLEAN NOT NULL DEFAULT false,
    `ecoMapUrl` VARCHAR(191) NOT NULL DEFAULT '',
    `ecoMapTitle` VARCHAR(191) NOT NULL DEFAULT 'Carte du monde',
    `siteDiscordUrl` VARCHAR(191) NULL,
    `siteServerIp` VARCHAR(191) NULL,
    `updatedBy` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `contact_messages` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `subject` VARCHAR(191) NOT NULL,
    `message` TEXT NOT NULL,
    `read` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `forum_categories` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `icon` VARCHAR(191) NULL,
    `color` VARCHAR(191) NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `forum_categories_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `forum_posts` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `excerpt` TEXT NULL,
    `authorName` VARCHAR(191) NOT NULL,
    `authorEmail` VARCHAR(191) NULL,
    `authorUserId` VARCHAR(191) NULL,
    `categoryId` VARCHAR(191) NOT NULL,
    `pinned` BOOLEAN NOT NULL DEFAULT false,
    `closed` BOOLEAN NOT NULL DEFAULT false,
    `approved` BOOLEAN NOT NULL DEFAULT false,
    `views` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `forum_posts_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `forum_comments` (
    `id` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `authorName` VARCHAR(191) NOT NULL,
    `authorEmail` VARCHAR(191) NULL,
    `authorUserId` VARCHAR(191) NULL,
    `postId` VARCHAR(191) NOT NULL,
    `approved` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `forum_reactions` (
    `id` VARCHAR(191) NOT NULL,
    `emoji` VARCHAR(191) NOT NULL,
    `voterToken` VARCHAR(191) NOT NULL,
    `postId` VARCHAR(191) NULL,
    `commentId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `forum_reactions_postId_voterToken_emoji_key`(`postId`, `voterToken`, `emoji`),
    UNIQUE INDEX `forum_reactions_commentId_voterToken_emoji_key`(`commentId`, `voterToken`, `emoji`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `forum_reports` (
    `id` VARCHAR(191) NOT NULL,
    `reason` VARCHAR(191) NOT NULL,
    `details` TEXT NULL,
    `reporterToken` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `postId` VARCHAR(191) NULL,
    `commentId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `suggestions` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `authorName` VARCHAR(191) NOT NULL,
    `authorEmail` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `upvotes` INTEGER NOT NULL DEFAULT 0,
    `downvotes` INTEGER NOT NULL DEFAULT 0,
    `adminNote` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `suggestion_votes` (
    `id` VARCHAR(191) NOT NULL,
    `suggestionId` VARCHAR(191) NOT NULL,
    `voterToken` VARCHAR(191) NOT NULL,
    `vote` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `suggestion_votes_suggestionId_voterToken_key`(`suggestionId`, `voterToken`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `tutorials` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `excerpt` TEXT NULL,
    `content` TEXT NOT NULL,
    `category` VARCHAR(191) NOT NULL DEFAULT 'debutant',
    `coverImage` VARCHAR(191) NULL,
    `featured` BOOLEAN NOT NULL DEFAULT false,
    `order` INTEGER NOT NULL DEFAULT 0,
    `published` BOOLEAN NOT NULL DEFAULT false,
    `views` INTEGER NOT NULL DEFAULT 0,
    `authorName` VARCHAR(191) NULL,
    `metaTitle` VARCHAR(191) NULL,
    `metaDesc` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `tutorials_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `recruitment_posts` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `subtitle` VARCHAR(191) NULL,
    `description` TEXT NOT NULL,
    `requirements` TEXT NOT NULL,
    `perks` TEXT NOT NULL,
    `icon` VARCHAR(191) NULL,
    `color` VARCHAR(191) NULL DEFAULT '#3A7A52',
    `slots` INTEGER NULL,
    `minRank` VARCHAR(191) NULL,
    `open` BOOLEAN NOT NULL DEFAULT true,
    `order` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `recruitment_applications` (
    `id` VARCHAR(191) NOT NULL,
    `postId` VARCHAR(191) NOT NULL,
    `playerName` VARCHAR(191) NOT NULL,
    `discordTag` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `age` INTEGER NULL,
    `experience` TEXT NOT NULL,
    `motivation` TEXT NOT NULL,
    `availability` VARCHAR(191) NULL,
    `timezone` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `adminNote` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `surveys` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `season` VARCHAR(191) NULL,
    `coverImage` VARCHAR(191) NULL,
    `endDate` DATETIME(3) NULL,
    `published` BOOLEAN NOT NULL DEFAULT false,
    `open` BOOLEAN NOT NULL DEFAULT true,
    `order` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `survey_questions` (
    `id` VARCHAR(191) NOT NULL,
    `surveyId` VARCHAR(191) NOT NULL,
    `question` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL DEFAULT 'text',
    `options` TEXT NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `required` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `survey_answers` (
    `id` VARCHAR(191) NOT NULL,
    `questionId` VARCHAR(191) NOT NULL,
    `surveyId` VARCHAR(191) NOT NULL,
    `response` TEXT NOT NULL,
    `sessionToken` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `city_memberships` (
    `id` VARCHAR(191) NOT NULL,
    `cityId` VARCHAR(191) NOT NULL,
    `playerName` VARCHAR(191) NOT NULL,
    `playerEmail` VARCHAR(191) NULL,
    `discordTag` VARCHAR(191) NULL,
    `message` TEXT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `role` VARCHAR(191) NULL,
    `joinedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `city_announcements` (
    `id` VARCHAR(191) NOT NULL,
    `cityId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `authorName` VARCHAR(191) NOT NULL,
    `pinned` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `city_comments` (
    `id` VARCHAR(191) NOT NULL,
    `announcementId` VARCHAR(191) NOT NULL,
    `authorName` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `city_projects` (
    `id` VARCHAR(191) NOT NULL,
    `cityId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `budget` INTEGER NULL,
    `startDate` DATETIME(3) NULL,
    `endDate` DATETIME(3) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'proposed',
    `progress` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `city_project_participants` (
    `id` VARCHAR(191) NOT NULL,
    `projectId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `role` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `city_collaborations` (
    `id` VARCHAR(191) NOT NULL,
    `projectId` VARCHAR(191) NOT NULL,
    `partnerCityId` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'accepted',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `city_collaborations_projectId_key`(`projectId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `city_votes` (
    `id` VARCHAR(191) NOT NULL,
    `cityId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `options` TEXT NOT NULL,
    `endDate` DATETIME(3) NULL,
    `published` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `city_vote_responses` (
    `id` VARCHAR(191) NOT NULL,
    `voteId` VARCHAR(191) NOT NULL,
    `option` VARCHAR(191) NOT NULL,
    `voterToken` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `city_vote_responses_voteId_voterToken_key`(`voteId`, `voterToken`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `page_contents` (
    `id` VARCHAR(191) NOT NULL,
    `page` VARCHAR(191) NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `value` LONGTEXT NOT NULL,
    `type` VARCHAR(191) NOT NULL DEFAULT 'text',
    `label` VARCHAR(191) NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `page_contents_page_key_key`(`page`, `key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `server_config` (
    `id` VARCHAR(191) NOT NULL DEFAULT 'singleton',
    `worldSize` VARCHAR(191) NOT NULL DEFAULT '4km',
    `difficulty` VARCHAR(191) NOT NULL DEFAULT 'Normal',
    `xpRate` VARCHAR(191) NOT NULL DEFAULT 'x1',
    `specialties` INTEGER NOT NULL DEFAULT 5,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'VLC',
    `season` VARCHAR(191) NOT NULL DEFAULT 'S1',
    `serverIp` VARCHAR(191) NULL,
    `serverPort` VARCHAR(191) NULL,
    `maxPlayers` INTEGER NULL,
    `modpack` VARCHAR(191) NULL,
    `description` TEXT NULL,
    `startDate` DATETIME(3) NULL,
    `endDate` DATETIME(3) NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `job_progressions` (
    `id` VARCHAR(191) NOT NULL,
    `configId` VARCHAR(191) NOT NULL,
    `jobName` VARCHAR(191) NOT NULL,
    `unlockDay` INTEGER NOT NULL,
    `description` VARCHAR(191) NULL,
    `icon` VARCHAR(191) NULL,
    `color` VARCHAR(191) NOT NULL DEFAULT '#3A7A52',
    `order` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `giveaways` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `prize` VARCHAR(191) NOT NULL,
    `image` VARCHAR(191) NULL,
    `endDate` DATETIME(3) NOT NULL,
    `published` BOOLEAN NOT NULL DEFAULT false,
    `ended` BOOLEAN NOT NULL DEFAULT false,
    `winnerId` VARCHAR(191) NULL,
    `winnerName` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `giveaway_entries` (
    `id` VARCHAR(191) NOT NULL,
    `giveawayId` VARCHAR(191) NOT NULL,
    `playerName` VARCHAR(191) NOT NULL,
    `discordTag` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `giveaway_entries_giveawayId_email_key`(`giveawayId`, `email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `audit_logs` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `userName` VARCHAR(191) NOT NULL,
    `action` VARCHAR(191) NOT NULL,
    `resource` VARCHAR(191) NOT NULL,
    `resourceId` VARCHAR(191) NULL,
    `detail` TEXT NULL,
    `ip` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `audit_logs_userId_idx`(`userId`),
    INDEX `audit_logs_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Foreign keys
ALTER TABLE `users` ADD CONSTRAINT `users_rankId_fkey` FOREIGN KEY (`rankId`) REFERENCES `ranks`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `users` ADD CONSTRAINT `users_jobId_fkey` FOREIGN KEY (`jobId`) REFERENCES `jobs`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `users` ADD CONSTRAINT `users_playerRankId_fkey` FOREIGN KEY (`playerRankId`) REFERENCES `player_ranks`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `direct_messages` ADD CONSTRAINT `direct_messages_senderId_fkey` FOREIGN KEY (`senderId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `direct_messages` ADD CONSTRAINT `direct_messages_receiverId_fkey` FOREIGN KEY (`receiverId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `channel_messages` ADD CONSTRAINT `channel_messages_channelId_fkey` FOREIGN KEY (`channelId`) REFERENCES `channels`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `channel_messages` ADD CONSTRAINT `channel_messages_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `articles` ADD CONSTRAINT `articles_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `users`(`id`) ON UPDATE CASCADE;
ALTER TABLE `changelogs` ADD CONSTRAINT `changelogs_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `users`(`id`) ON UPDATE CASCADE;
ALTER TABLE `guides` ADD CONSTRAINT `guides_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `users`(`id`) ON UPDATE CASCADE;
ALTER TABLE `events` ADD CONSTRAINT `events_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `users`(`id`) ON UPDATE CASCADE;
ALTER TABLE `event_images` ADD CONSTRAINT `event_images_eventId_fkey` FOREIGN KEY (`eventId`) REFERENCES `events`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `city_images` ADD CONSTRAINT `city_images_cityId_fkey` FOREIGN KEY (`cityId`) REFERENCES `cities`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `rules` ADD CONSTRAINT `rules_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `rule_categories`(`id`) ON UPDATE CASCADE;
ALTER TABLE `faq_items` ADD CONSTRAINT `faq_items_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `faq_categories`(`id`) ON UPDATE CASCADE;
ALTER TABLE `forum_posts` ADD CONSTRAINT `forum_posts_authorUserId_fkey` FOREIGN KEY (`authorUserId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `forum_posts` ADD CONSTRAINT `forum_posts_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `forum_categories`(`id`) ON UPDATE CASCADE;
ALTER TABLE `forum_comments` ADD CONSTRAINT `forum_comments_authorUserId_fkey` FOREIGN KEY (`authorUserId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `forum_comments` ADD CONSTRAINT `forum_comments_postId_fkey` FOREIGN KEY (`postId`) REFERENCES `forum_posts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `forum_reactions` ADD CONSTRAINT `forum_reactions_postId_fkey` FOREIGN KEY (`postId`) REFERENCES `forum_posts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `forum_reactions` ADD CONSTRAINT `forum_reactions_commentId_fkey` FOREIGN KEY (`commentId`) REFERENCES `forum_comments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `forum_reports` ADD CONSTRAINT `forum_reports_postId_fkey` FOREIGN KEY (`postId`) REFERENCES `forum_posts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `forum_reports` ADD CONSTRAINT `forum_reports_commentId_fkey` FOREIGN KEY (`commentId`) REFERENCES `forum_comments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `suggestion_votes` ADD CONSTRAINT `suggestion_votes_suggestionId_fkey` FOREIGN KEY (`suggestionId`) REFERENCES `suggestions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `recruitment_applications` ADD CONSTRAINT `recruitment_applications_postId_fkey` FOREIGN KEY (`postId`) REFERENCES `recruitment_posts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `survey_questions` ADD CONSTRAINT `survey_questions_surveyId_fkey` FOREIGN KEY (`surveyId`) REFERENCES `surveys`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `survey_answers` ADD CONSTRAINT `survey_answers_questionId_fkey` FOREIGN KEY (`questionId`) REFERENCES `survey_questions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `survey_answers` ADD CONSTRAINT `survey_answers_surveyId_fkey` FOREIGN KEY (`surveyId`) REFERENCES `surveys`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `city_memberships` ADD CONSTRAINT `city_memberships_cityId_fkey` FOREIGN KEY (`cityId`) REFERENCES `cities`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `city_announcements` ADD CONSTRAINT `city_announcements_cityId_fkey` FOREIGN KEY (`cityId`) REFERENCES `cities`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `city_comments` ADD CONSTRAINT `city_comments_announcementId_fkey` FOREIGN KEY (`announcementId`) REFERENCES `city_announcements`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `city_projects` ADD CONSTRAINT `city_projects_cityId_fkey` FOREIGN KEY (`cityId`) REFERENCES `cities`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `city_project_participants` ADD CONSTRAINT `city_project_participants_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `city_projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `city_collaborations` ADD CONSTRAINT `city_collaborations_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `city_projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `city_collaborations` ADD CONSTRAINT `city_collaborations_partnerCityId_fkey` FOREIGN KEY (`partnerCityId`) REFERENCES `cities`(`id`) ON UPDATE CASCADE;
ALTER TABLE `city_votes` ADD CONSTRAINT `city_votes_cityId_fkey` FOREIGN KEY (`cityId`) REFERENCES `cities`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `city_vote_responses` ADD CONSTRAINT `city_vote_responses_voteId_fkey` FOREIGN KEY (`voteId`) REFERENCES `city_votes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `job_progressions` ADD CONSTRAINT `job_progressions_configId_fkey` FOREIGN KEY (`configId`) REFERENCES `server_config`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `giveaway_entries` ADD CONSTRAINT `giveaway_entries_giveawayId_fkey` FOREIGN KEY (`giveawayId`) REFERENCES `giveaways`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
