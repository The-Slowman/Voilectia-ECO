# Simplification en vitrine/wiki — Phase B

Finalisation de la vitrine après la Phase A (suppression du système membre/communauté).

## Renommage de routes (redirections 301)

- `/serveur` → `/configuration`
- `/top-serveur` → `/vote`

Liens internes, sitemap, mapping maintenance et `lib/settings` mis à jour en conséquence.

## Nouvelle page

- **`/discord`** : page d'atterrissage communauté (rôle de Discord : discussions, support/tickets,
  candidatures, suggestions, annonces) avec gros bouton « Rejoindre », URL lue depuis la BDD
  (`siteDiscordUrl`, fallback `NEXT_PUBLIC_DISCORD_URL`). Metadata + OpenGraph.

## Pages retirées (redirigées vers `/`)

`/staff`, `/federation`, `/carte`, `/soutenir` — pages publiques supprimées + retirées de la nav.
(`admin/staff` et le modèle `StaffMember` sont conservés en base, mais sans page publique —
à supprimer plus tard si tu n'en veux plus du tout.)

## Menu public final

**Header** : Accueil · Présentation · Serveur ▾ (Configuration, Progression, Économie, Règlement) ·
Guides ▾ (Guides, Tutoriels, Changelog, FAQ) · Événements ▾ (Événements, Giveaways) ·
Vote 🏆 · Discord · + bouton Discord (CTA).

**Footer** : Serveur (Présentation, Règlement, Changelog, Guides) · Communauté (Événements,
Giveaways, Discord) · Informations (Voter, Économie, Progression, Configuration, FAQ).

## SEO

- Le layout racine fournit déjà : `metadataBase`, template de titre, OpenGraph, Twitter Card,
  robots, canonical racine.
- **Canonicals ajoutés** sur toutes les pages publiques (presentation, reglement, configuration,
  progression, economie, guides, tutoriels, changelog, faq, evenements, discord, vote).
- **Sitemap** mis à jour : `/configuration`, `/vote`, `/discord` ajoutées ; `/serveur`,
  `/top-serveur`, `/federation`, `/staff`, `/soutenir` retirées.
- `robots.ts` : disallow réduit à `/admin/` et `/api/`.

## Routes publiques finales

`/` · `/presentation` · `/reglement` · `/configuration` · `/progression` · `/economie` ·
`/guides` · `/tutoriels` · `/changelog` · `/evenements` · `/giveaways` · `/faq` · `/vote` ·
`/discord` · `/actualites/[slug]` · `/p/[slug]`.

## À faire côté toi (validation locale)

```bash
npm install
npx prisma generate
npm run lint
npm run build
```

> Pense à renseigner le bon lien Discord dans l'admin (Paramètres → `siteDiscordUrl`) et
> l'URL de vote sur la page `/vote` si besoin. L'index Git était verrouillé : `git add -A && git commit`.

## Restes optionnels (Phase C éventuelle)

- Supprimer définitivement `admin/staff` + `StaffMember` si la page Staff ne revient pas.
- Boutons CTA « Voter » et « Discord » encore plus visibles sur la home (hero).
- Page `/vote` : automatiser le lien Top-Serveur depuis la BDD (actuellement en dur).
