# Guide de migration Voilectia — Prisma

## Première installation (base de données vide)

```bash
# 1. Copier les variables d'environnement
cp .env.example .env.local
# Remplir DATABASE_URL, AUTH_SECRET, etc.

# 2. Installer les dépendances
npm install

# 3. Appliquer les migrations (crée toutes les tables)
npm run db:migrate:deploy

# 4. Peupler les données initiales (optionnel)
npm run db:seed

# 5. Builder le projet
npm run build
```

## Déploiement en production (Hostinger)

Le script `build` exécute automatiquement `prisma migrate deploy` avant le build Next.js.

```bash
npm run build
# Équivalent à : prisma migrate deploy && next build
```

## Ajouter une migration après un changement de schéma

**En développement (local) :**
```bash
# Après modification de prisma/schema.prisma
npm run db:migrate
# Saisir un nom pour la migration (ex: "add_adminToken_to_users")
```

**En production :**
```bash
npm run db:migrate:deploy
# Applique les migrations en attente sans risque de perte de données
```

## ⚠️ À NE JAMAIS UTILISER EN PRODUCTION

```bash
# INTERDIT en production — peut supprimer des données
prisma db push --accept-data-loss
```

## Variables d'environnement requises

Voir `.env.example` pour la liste complète.

Variable ajoutée récemment :
- `NEXT_PUBLIC_SITE_URL` — URL publique du site (ex: `https://voilectia.fr`)
