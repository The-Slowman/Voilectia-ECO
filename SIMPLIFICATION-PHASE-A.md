# Simplification en vitrine/wiki — Phase A

Transformation du site en plateforme publique d'information + admin privé.
**Phase A** = suppression du système membre/communauté + nettoyage Prisma + migration + nav.
La **Phase B** (renommage de routes, pages `/discord` & `/vote`, refonte visuelle, SEO) reste à faire.

## Supprimé

### Système membre / joueur
- Pages : `connexion`, `inscription`, `profil`, `messagerie`.
- Auth joueur : `api/player/auth/**`, `api/auth/steam/**`, `lib/player-auth.ts`, `lib/steam.ts`,
  composants `PlayerAuthButton`, `SteamLoginButton`.
- Comptes joueurs supprimés en base (migration `DELETE … role='PLAYER'`).
- Colonnes joueur retirées de `users` : `discordTag`, `ecoName`, `bio`, `jobId`,
  `playerRankId`, `playerToken`, `banned`.

### Communauté on-site (→ Discord)
- Forum (`/forum`, `api/forum/**`, composants forum, modèles `Forum*`).
- Suggestions (`/suggestions`, `api/suggestions/**`, modèles `Suggestion*`).
- Sondages (`/sondage`, `api/surveys/**`, composant survey, modèles `Survey*`).
- Recrutement on-site (`/recrutement`, `api/recruitment/**`, modèles `Recruitment*`).
- Messagerie & canaux (`/messagerie`, `api/messages/**`, `api/channels/**`, modèles
  `DirectMessage`, `Channel`, `ChannelMessage`).
- Formulaire de contact (`/contact`, `api/contact`, modèle `ContactMessage`) → Discord.
- Métiers joueur (`Job`, `api/jobs`, `admin/jobs`) et rangs in-game (`PlayerRank`).

### Admin
- Sections retirées : `admin/membres/**`, `admin/forum/**`, `admin/suggestions`,
  `admin/sondage`, `admin/recrutement`, `admin/messages`, `admin/jobs`.
- API admin retirées : `api/admin/members/**`, `api/admin/messages/**`, `api/players`,
  `api/ranks/assign`.
- Dashboard admin réécrit (orienté contenu : articles, guides, changelog, événements…).
- Sidebar/Header admin simplifiés (Contenu · Serveur · Événements · Staff · Administration).
- `admin/rangs` réduit aux rangs **staff** (permissions d'admin) ; permissions de modules
  supprimés retirées (`canManageForum`, `canManageSurveys`, `canManageRecruitment`).

## Conservé

- **Admin** : auth admin par session hashée (`AdminSession`), middleware admin,
  dashboard, Pages CMS, Articles/Actualités, Guides, Tutoriels, Changelog, Règlement,
  FAQ, Configuration serveur, Progression métiers (`JobProgression`), Événements,
  Giveaways, Staff, Rôles staff, Médias, Paramètres, Audit/Logs.
- **Public** : accueil, présentation, règlement, configuration (`/serveur`), progression,
  économie, guides, tutoriels, changelog, événements, giveaways, FAQ, staff, top-serveur,
  actualités, pages CMS (`/p/...`), fédération, soutenir, carte.

## Base de données (migration)

`prisma/migrations/20260609000000_simplify_public_site_remove_members/` :
drop des tables communauté/joueur, suppression des comptes `PLAYER`, nettoyage des
colonnes joueur sur `users` et des permissions de rangs obsolètes.

Schéma final : **25 modèles** orientés contenu/admin (plus aucune table membre/forum/villes).

## Redirections (next.config.mjs)

`/login`, `/register`, `/connexion`, `/inscription`, `/profile`, `/profil`, `/account`,
`/messages`, `/messagerie`, `/members`, `/membres`, `/users`, `/forum/*`, `/suggestions/*`,
`/sondage(s)`, `/recrutement`, `/villes/*`, `/cities`, `/settlements` → `/` (302).

---

## À faire côté toi (validation locale — je ne peux pas compiler ici)

```bash
npm install
npx prisma validate
npx prisma generate
npm run lint
npm run build
npm run db:migrate:deploy   # applique la migration (SAUVEGARDE la base avant : mysqldump)
```

⚠️ La migration **supprime définitivement** les données forum/messages/suggestions/
sondages/candidatures/comptes joueurs. Fais un `mysqldump` avant.

## Phase B (proposée, à valider)

1. Renommer les routes : `/serveur` → `/configuration`, `/top-serveur` → `/vote`.
2. Créer des pages dédiées `/discord` et `/vote`.
3. Menu public final simplifié + boutons Discord/Vote visibles (CTA vitrine).
4. Décider du sort des pages hors-liste : `federation`, `soutenir`, `carte`, `staff`,
   `tutoriels` (garder/fusionner/rediriger).
5. SEO : OpenGraph/Twitter par page, canonicals, metadata dynamiques, sitemap déjà nettoyé.
6. Remplacer les anciens points communautaires par des liens Discord (tickets, candidatures,
   suggestions, support).
