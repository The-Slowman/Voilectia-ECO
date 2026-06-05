# 🌿 Voilectia ECO — Guide d'installation

## Prérequis

| Outil    | Version minimale | Vérification           |
|----------|-----------------|------------------------|
| Node.js  | 18.x ou 20.x    | `node --version`       |
| npm/pnpm | npm 9+ ou pnpm  | `npm --version`        |
| Git      | Optionnel        | `git --version`        |

---

## 1. Installation des dépendances

```bash
cd "Voilectia ECO"
npm install
```

---

## 2. Configuration de l'environnement

```bash
# Copier le fichier d'exemple
cp .env.example .env.local

# Éditer le fichier
notepad .env.local   # Windows
nano .env.local      # Linux/Mac
```

### Variables obligatoires à modifier

```env
# Secret NextAuth (OBLIGATOIRE — générer avec la commande ci-dessous)
AUTH_SECRET="..."

# Générer le secret :
# Linux/Mac : openssl rand -base64 32
# Windows PowerShell : [Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))

# URL du site en production (sans slash final)
NEXT_PUBLIC_SITE_URL="https://votre-domaine.fr"
NEXTAUTH_URL="https://votre-domaine.fr"

# URL de votre Discord
NEXT_PUBLIC_DISCORD_URL="https://discord.gg/VOTRE_CODE_ICI"

# ── Steam (connexion joueurs) ─────────────────────────────────
# Clé API Steam Web (gratuite) : https://steamcommunity.com/dev/apikey
# Domaine à enregistrer = votre-domaine.fr
STEAM_API_KEY="VOTRE_CLE_API_STEAM"
```

---

## 3. Base de données

```bash
# Créer/migrer la base SQLite
npm run db:push

# Peupler avec les données initiales
npm run db:seed
```

Les données de seed créent :
- **Un admin** : `admin@voilectia.fr` / `VoilectiaAdmin2024!`
- ⚠️ **Changez ce mot de passe immédiatement** via `/admin/parametres`

---

## 4. Ajouter le logo

Placez le logo officiel Voilectia dans :
```
public/images/logo.png
```

Format recommandé : PNG avec fond transparent, 512×512px minimum.

---

## 5. Lancer le serveur de développement

```bash
npm run dev
```

Ouvrez : [http://localhost:3000](http://localhost:3000)
Admin : [http://localhost:3000/admin](http://localhost:3000/admin)

---

## 6. Build de production

```bash
npm run build
npm run start
```

---

## Architecture des dossiers

```
voilectia-web/
├── src/
│   ├── app/
│   │   ├── (site)/          # Pages publiques
│   │   │   ├── page.tsx     # Accueil
│   │   │   ├── presentation/
│   │   │   ├── reglement/
│   │   │   ├── changelog/
│   │   │   ├── guides/
│   │   │   ├── economie/
│   │   │   ├── villes/
│   │   │   ├── federation/
│   │   │   ├── evenements/
│   │   │   ├── staff/
│   │   │   ├── soutenir/
│   │   │   ├── faq/
│   │   │   └── contact/
│   │   ├── admin/           # Panel d'administration
│   │   │   ├── login/
│   │   │   ├── articles/
│   │   │   ├── changelog/
│   │   │   ├── guides/
│   │   │   ├── evenements/
│   │   │   ├── staff/
│   │   │   ├── villes/
│   │   │   ├── reglement/
│   │   │   ├── faq/
│   │   │   ├── medias/
│   │   │   └── parametres/
│   │   └── api/             # Routes API REST
│   ├── components/
│   │   ├── layout/          # Header, Footer
│   │   ├── ui/              # Composants réutilisables
│   │   └── admin/           # Composants admin
│   ├── lib/
│   │   ├── auth.ts          # NextAuth config
│   │   ├── db.ts            # Prisma client
│   │   └── utils.ts         # Utilitaires
│   └── app/globals.css      # Styles globaux
├── prisma/
│   ├── schema.prisma        # Modèle de données
│   ├── seed.ts              # Données initiales
│   └── voilectia.db         # Base SQLite (auto-générée)
└── public/
    ├── images/              # Images statiques + logo
    └── uploads/             # Médias uploadés via admin
```

---

## Déploiement

### Option A : Hostinger Node.js (recommandé)

#### 1. Créer la base de données MySQL sur Hostinger

Dans le panel Hostinger : **Hosting → Gérer → Bases de données MySQL**

1. Cliquez **Créer une base de données**
2. Notez : `Nom de la base`, `Utilisateur`, `Mot de passe`, `Hôte` (généralement `127.0.0.1`)

#### 2. Pousser le projet sur GitHub

Sur votre ordinateur, dans le dossier du projet :

```bash
git init
git branch -m main
git add -A
git commit -m "Initial commit"

# Créez un repo sur github.com, puis :
git remote add origin https://github.com/VOTRE_PSEUDO/voilectia-eco.git
git push -u origin main
```

#### 3. Déployer sur Hostinger

1. Dans Hostinger : **Node.js → Déployer → Importer un dépôt Git**
2. Connectez votre compte GitHub et sélectionnez le repo `voilectia-eco`
3. Configurez :
   - **Build command** : `npm run build`
   - **Start command** : `npm run start`
   - **Node.js version** : 20.x

#### 4. Variables d'environnement

Dans Hostinger : **Node.js → Variables d'environnement**, ajoutez :

```env
DATABASE_URL=mysql://UTILISATEUR:MOT_DE_PASSE@127.0.0.1:3306/NOM_BASE
AUTH_SECRET=VOTRE_SECRET_ALEATOIRE
NEXTAUTH_URL=https://votre-domaine.fr
NEXT_PUBLIC_SITE_URL=https://votre-domaine.fr
NEXT_PUBLIC_DISCORD_URL=https://discord.gg/VOTRE_CODE
STEAM_API_KEY=VOTRE_CLE_STEAM
NODE_ENV=production
```

Pour générer `AUTH_SECRET` (à faire sur votre PC Linux/Mac) :
```bash
openssl rand -base64 32
```
Ou en ligne : https://generate-secret.vercel.app/32

#### 5. Créer les tables (première fois uniquement)

Via le terminal SSH Hostinger ou en ajoutant temporairement ce script au build :

```bash
# Dans le terminal SSH Hostinger
cd ~/voilectia-eco
npm run db:push
npm run db:seed
```

> ⚠️ Changez le mot de passe admin par défaut dès la première connexion sur `/admin`

#### 6. Redéployer après une mise à jour

```bash
# Sur votre PC
git add -A
git commit -m "Description des changements"
git push

# Hostinger redéploie automatiquement si le webhook est configuré
# Sinon : Hostinger → Node.js → Redéployer
```

---

### Option B : Vercel

1. Créez un compte sur [vercel.com](https://vercel.com)
2. Importez votre projet GitHub
3. Ajoutez les variables d'environnement dans le dashboard Vercel
4. **Important pour Vercel** : Migrez vers PostgreSQL (Vercel Postgres ou Supabase)
   - Changez `provider = "sqlite"` → `provider = "postgresql"` dans `prisma/schema.prisma`
   - Mettez à jour `DATABASE_URL` avec la chaîne PostgreSQL

### Option B : VPS (Linux)

```bash
# Sur votre VPS Ubuntu/Debian
sudo apt install nodejs npm nginx

# Cloner & configurer
git clone <votre-repo>
cd voilectia-web
npm install
cp .env.example .env.local
# Éditer .env.local

# Build
npm run build

# Lancer avec PM2
npm install -g pm2
pm2 start npm --name "voilectia" -- start
pm2 save
pm2 startup

# Configurer Nginx (reverse proxy vers port 3000)
```

**Exemple config Nginx :**
```nginx
server {
    listen 80;
    server_name voilectia.fr www.voilectia.fr;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Maintenance

### Mise à jour du contenu
Tout le contenu se gère via `/admin` — aucune modification de code nécessaire.

### Sauvegardes
```bash
# Sauvegarder la base SQLite
cp prisma/voilectia.db backups/voilectia-$(date +%Y%m%d).db

# Sauvegarder les uploads
tar -czf backups/uploads-$(date +%Y%m%d).tar.gz public/uploads/
```

### Mise à jour du code
```bash
git pull
npm install
npm run db:migrate  # Si nouvelles migrations
npm run build
pm2 restart voilectia

### ⚠️ Mise à jour — Nouvelles tables (Recrutement & Sondages)

Si vous mettez à jour depuis une version antérieure, appliquez les nouveaux modèles Prisma :

```bash
npx prisma db push
# ou si vous utilisez des migrations :
npx prisma migrate dev --name "add_recruitment_surveys"
```

Cela crée les tables :
- `recruitment_posts` — Postes de recrutement
- `recruitment_applications` — Candidatures
- `surveys` — Sondages
- `survey_questions` — Questions
- `survey_answers` — Réponses anonymes
```

### Changer le mot de passe admin
Connectez-vous sur `/admin`, allez dans **Paramètres → Mon compte**.

---

## Sécurité

- ✅ Sessions JWT signées avec `AUTH_SECRET`
- ✅ Validation des entrées avec Zod
- ✅ Protection des routes API (vérification session)
- ✅ Upload sécurisé (type + taille vérifiés)
- ✅ Admin inaccessible sans authentification
- ✅ Robots.txt protège `/admin` et `/api`

**En production :**
- Activez HTTPS (Let's Encrypt via Certbot)
- Changez `AUTH_SECRET` par une valeur aléatoire unique
- Changez le mot de passe admin par défaut
- Configurez un firewall (n'exposez que les ports 80 et 443)

---

## Support

Pour toute question technique, ouvrez un ticket sur le Discord Voilectia.
