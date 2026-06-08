# Refonte sécurité & architecture — bloc critique

Branche : `refactor/critical-hardening` (créée, mais l'index Git était verrouillé par
l'app — voir « À faire côté Git » plus bas).

## Ce qui a été fait

### Priorité 1 — Sécurité

1. **Sanitisation HTML centralisée** (`src/lib/sanitize.ts`)
   - Réécrite avec `sanitize-html` (allowlist stricte) au lieu de regex.
   - Appliquée à **tous** les `dangerouslySetInnerHTML` :
     - Server Components (au rendu) : actualités, tutoriels, pages CMS (`/p/[slug]`),
       présentation, `ChangelogCard`.
     - Composants client (à la source API) : forum (`GET /api/forum/posts/[id]` +
       écriture POST/PATCH) et recrutement (`GET/POST /api/recruitment/posts`).
   - Le JSON-LD de la home n'est pas concerné (donnée structurée, pas du HTML utilisateur).
   - Les commentaires forum sont rendus en texte brut (échappés par React) → non sanitisés
     pour ne pas les déformer.

2. **Auth admin durcie** (`src/lib/admin-auth.ts`, `src/lib/auth.ts`)
   - Nouveau modèle **`AdminSession`** : seul le **hash SHA-256** du token est stocké
     (le token brut ne vit que dans le cookie).
   - **Expiration** (7 j), **suppression** de session au logout, nettoyage des sessions
     expirées à la volée.
   - Colonne `users.adminToken` (token en clair) **supprimée**.
   - Cookies : `httpOnly`, `secure` en production (`NODE_ENV==='production'`),
     `sameSite: lax`.
   - Helpers centralisés : `createAdminSession`, `destroyAdminSession`,
     `resolveAdminSession`, `getAdminFromRequest` (signature inchangée → 61 routes intactes).

3. **Rate limit pluggable** (`src/lib/rate-limit.ts`)
   - Utilise **Upstash Redis (REST)** si `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`
     sont définis ; sinon fallback in-memory **documenté** (correct en mono-instance Hostinger).
   - « Fail-open » sur erreur réseau pour ne jamais casser le site.

### Priorité 2 — Architecture

4. **Middleware sans dépendance BDD/HTTP interne** (`src/middleware.ts`)
   - Suppression du `fetch('/api/settings')`.
   - La logique **maintenance** est déplacée dans `(site)/layout.tsx` (Server Component)
     via `src/lib/settings.ts`, avec **valeurs par défaut sûres** si la BDD est indisponible
     (le site reste accessible plutôt que de planter).
   - Le middleware ne fait plus que : rate limit, garde de présence du cookie admin,
     en-têtes de sécurité, exposition du `x-pathname`.

5. **Build ≠ migrations** (`package.json`)
   - `build` = `next build` (plus de `prisma migrate deploy` au build).
   - Migrations via `npm run db:migrate:deploy`.

### Priorité 3 — Nettoyage

6. Archive `Nouveau Archive WinRAR.zip` supprimée (le `.gitignore` couvrait déjà
   `*.zip/*.rar/*.7z`).

### Suppression complète du module Villes

- Pages supprimées : `(site)/villes/**`, `admin/villes/**`.
- Routes API supprimées : `api/cities/**`, `api/city-comments`, `api/villes`.
- Composants supprimés : `components/city/**`.
- Liens retirés : Header, Footer, Sidebar admin, Header admin, dashboard admin
  (carte « Villes actives » + action rapide), quick-creates.
- Permissions : `Rank.canManageVilles` retiré (schéma + UI rangs).
- Modèles Prisma supprimés : `City`, `CityImage`, `CityMembership`, `CityAnnouncement`,
  `CityComment`, `CityProject`, `CityProjectParticipant`, `CityCollaboration`, `CityVote`,
  `CityVoteResponse`.
- `sitemap.ts`, `admin dashboard` (`cityCount`), dossier d'upload `cities` : nettoyés.
- Seed : mention « Villes vivantes » retirée.
- **Vérifié** : plus aucune référence `City`, `prisma.city`, `/villes`, `canManageVilles`
  dans `src/`.
- **Conservé volontairement** : la catégorie de guides « Villes » (`GUIDE_CATEGORIES.ville`
  dans `utils.ts`) et le label d'audit `city` — ce sont de la taxonomie de contenu /
  de l'historique immuable, pas le module supprimé.

### Migration Prisma

Nouvelle migration : `prisma/migrations/20260608000000_remove_villes_add_admin_sessions/`
(drop tables city_*, création `admin_sessions`, drop `users.adminToken`,
drop `ranks.canManageVilles`).

---

## À faire côté toi (validation locale)

Je n'ai pas pu exécuter ta toolchain (node_modules Windows + binaires Prisma bloqués
dans le sandbox). À lancer dans le dossier du projet :

```bash
npm install                 # installe sanitize-html + @types/sanitize-html
npx prisma validate
npx prisma generate
npm run lint
npm run build
```

Puis appliquer la migration sur ta base :

```bash
npm run db:migrate:deploy
```

> Variante recommandée si tu préfères que Prisma régénère le SQL lui-même :
> supprime le dossier `20260608000000_remove_villes_add_admin_sessions`, puis
> `npx prisma migrate dev --name remove_villes_add_admin_sessions` (en local).

## Déploiement (Hostinger) — important

Le build ne lance **plus** les migrations. Ajoute une étape de migration dans ton
pipeline de déploiement, par exemple :

```bash
npm install && npm run db:migrate:deploy && npm run build && npm start
```

## Variables d'environnement (optionnel)

Pour activer le rate limit persistant (Upstash) :

```
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
```

Sinon, le fallback in-memory reste actif (suffisant en mono-instance).
