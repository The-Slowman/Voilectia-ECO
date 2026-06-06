# Guide de migration Voilectia — Prisma

## Première installation (base de données vide)

```bash
# 1. Copier les variables d'environnement
cp .env.example .env.local
# Remplir DATABASE_URL, AUTH_SECRET, etc.

# 2. Installer les dépendances
npm install

# 3. Builder le projet (applique les migrations + build Next.js)
npm run build
```

## Déploiement en production (Hostinger — base de données existante)

Le script `build` gère automatiquement les deux cas :

```bash
npm run build
# Équivalent à :
# prisma migrate resolve --applied 0001_initial 2>/dev/null
# prisma migrate deploy
# next build
```

**Explication :**
- `prisma migrate resolve --applied 0001_initial` marque la migration initiale comme déjà
  appliquée (pour les BDD existantes qui ont des tables mais pas d'historique Prisma).
  Si la migration est déjà enregistrée, cette commande échoue silencieusement.
- `prisma migrate deploy` applique ensuite toutes les migrations en attente (0 au premier
  déploiement si la BDD était déjà à jour).

## Erreur P3005 — The database schema is not empty

Cette erreur survient quand Prisma voit des tables existantes sans historique de migrations.
Le script `build` la gère automatiquement via `migrate resolve`. Si vous la rencontrez
manuellement, exécutez :

```bash
npm run db:baseline
# puis
npm run build
```

## Ajouter une migration après un changement de schéma

**En développement (local) :**
```bash
# Après modification de prisma/schema.prisma
npm run db:migrate
# Saisir un nom (ex: "add_adminToken_to_users")
```

**En production :**
```bash
npm run build
# prisma migrate deploy applique automatiquement les nouvelles migrations
```

## ⚠️ À NE JAMAIS UTILISER EN PRODUCTION

```bash
# INTERDIT — peut supprimer des données
prisma db push --accept-data-loss
```

## Variables d'environnement requises

Voir `.env.example` pour la liste complète.
