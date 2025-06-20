# 💧 Elengi Water - Système de Gestion Financière

## 📋 Vue d'ensemble

**Elengi Water** est une application web moderne de gestion financière personnelle et d'entreprise, développée avec Next.js 15, TypeScript, et Prisma. Le système permet de suivre les revenus et dépenses avec des résumés automatiques journaliers, hebdomadaires et mensuels.

## 🚀 Fonctionnalités Principales

### 💰 Gestion des Opérations
- **Enregistrement d'opérations** : Ajout de revenus et dépenses avec montant, catégorie et description
- **Modification d'opérations** : Édition complète des opérations existantes
- **Suppression d'opérations** : Suppression sécurisée avec confirmation
- **Liste des opérations** : Vue d'ensemble de toutes les transactions
- **Catégorisation** : Système de catégories prédéfinies pour organiser les transactions
- **Validation** : Contrôles de saisie et validation des données côté client et serveur
- **Historique** : Suivi complet de toutes les transactions avec horodatage
- **Vue admin** : Les administrateurs voient toutes les opérations de tous les utilisateurs
- **Vue utilisateur** : Les utilisateurs voient seulement leurs propres opérations

### 🏷️ Gestion des Catégories
- **Création de catégories** : Ajout de nouvelles catégories personnalisées
- **Modification de catégories** : Édition du nom et du type des catégories
- **Suppression de catégories** : Suppression sécurisée (si aucune opération liée)
- **Liste des catégories** : Vue d'ensemble de toutes les catégories
- **Types de catégories** : Distinction entre revenus et dépenses
- **Protection des données** : Empêche la suppression de catégories utilisées

### 📊 Résumés Automatiques
- **Résumé journalier** : Vue d'ensemble des opérations du jour
- **Résumé hebdomadaire** : Analyse des 7 derniers jours
- **Résumé mensuel** : Statistiques complètes du mois en cours
- **Calculs automatiques** des totaux, moyennes et tendances
- **Graphiques visuels** pour une meilleure compréhension
- **Vue admin** : Les administrateurs voient les totaux cumulés de tous les utilisateurs
- **Vue utilisateur** : Les utilisateurs voient seulement leurs propres totaux
- **Filtre par utilisateur** : Les admins peuvent filtrer les données par utilisateur spécifique

### 👥 Système d'Authentification
- **NextAuth.js** pour l'authentification sécurisée
- **Rôles utilisateur** : ADMIN et USER
- **Protection des routes** : Accès contrôlé selon les permissions
- **Gestion des sessions** : Connexion/déconnexion sécurisée

### 🎨 Interface Utilisateur
- **Design moderne** avec Tailwind CSS
- **Thème sombre/clair** avec toggle automatique
- **Interface responsive** pour tous les appareils
- **Navigation intuitive** avec sidebar latérale
- **Feedback utilisateur** avec messages de confirmation/erreur

## 🏗️ Architecture Technique

### Stack Technologique
```
Frontend:
├── Next.js 15 (App Router)
├── React 19
├── TypeScript
├── Tailwind CSS
└── Lucide React (icônes)

Backend:
├── Next.js API Routes
├── Prisma ORM
├── PostgreSQL (Supabase)
└── NextAuth.js

Outils:
├── ESLint
├── PostCSS
└── Recharts (graphiques)
```

### Structure de la Base de Données

#### 🗄️ Modèles Prisma

```prisma
// Utilisateurs
model User {
  id              Int               @id @default(autoincrement())
  email           String            @unique
  password        String
  name            String?
  role            Role              @default(USER)
  createdAt       DateTime          @default(now())
  
  operations      Operation[]
  summaries       MonthlySummary[]
  dailySummaries  DailySummary[]
  weeklySummaries WeeklySummary[]
}

// Opérations financières
model Operation {
  id          Int           @id @default(autoincrement())
  user        User          @relation(fields: [userId], references: [id])
  userId      Int
  type        OperationType // 'income' ou 'expense'
  category    Category      @relation(fields: [categoryId], references: [id])
  categoryId  Int
  amount      Float
  date        DateTime      @default(now())
  description String?
  createdAt   DateTime      @default(now())
}

// Catégories d'opérations
model Category {
  id         Int         @id @default(autoincrement())
  name       String      @unique
  type       OperationType
  operations Operation[]
}

// Résumés automatiques
model DailySummary {
  id           Int     @id @default(autoincrement())
  userId       Int
  date         DateTime
  totalIncome  Float   @default(0)
  totalExpense Float   @default(0)
  balance      Float   @default(0)
  user         User    @relation(fields: [userId], references: [id])
  
  @@unique([userId, date])
}

model WeeklySummary {
  id           Int     @id @default(autoincrement())
  userId       Int
  week         Int
  year         Int
  totalIncome  Float   @default(0)
  totalExpense Float   @default(0)
  balance      Float   @default(0)
  user         User    @relation(fields: [userId], references: [id])
  
  @@unique([userId, week, year])
}

model MonthlySummary {
  id           Int      @id @default(autoincrement())
  user         User     @relation(fields: [userId], references: [id])
  userId       Int
  month        Int
  year         Int
  totalIncome  Float    @default(0)
  totalExpense Float    @default(0)
  balance      Float    @default(0)
  createdAt    DateTime @default(now())
  
  @@unique([userId, month, year])
}
```

## 📁 Structure du Projet

```
elengi_water-financier/
├── 📁 prisma/                    # Configuration base de données
│   ├── schema.prisma            # Modèles et relations
│   ├── seed.ts                  # Données initiales
│   └── migrations/              # Migrations Prisma
├── 📁 src/
│   ├── 📁 app/
│   │   ├── 📁 (main)/           # Routes principales
│   │   ├── 📁 api/              # API Routes
│   │   │   ├── 📁 auth/         # Authentification
│   │   │   ├── 📁 categories/   # Gestion catégories
│   │   │   │   └── 📁 [id]/     # Catégories individuelles (GET/PUT/DELETE)
│   │   │   ├── 📁 operations/   # Gestion opérations
│   │   │   │   └── 📁 [id]/     # Opérations individuelles (GET/PUT/DELETE)
│   │   │   └── 📁 users/        # Gestion utilisateurs
│   │   ├── 📁 components/       # Composants React
│   │   │   ├── 📁 auth/         # Composants d'auth
│   │   │   ├── 📁 layout/       # Layout et navigation
│   │   │   └── 📁 ui/           # Composants UI
│   │   ├── 📁 dashboard/        # Interface dashboard
│   │   │   ├── 📁 categories/   # Gestion catégories
│   │   │   │   ├── 📁 create/   # Création de catégories
│   │   │   │   └── 📁 edit/     # Édition de catégories
│   │   │   ├── 📁 operations/   # Gestion opérations
│   │   │   │   ├── 📁 list/     # Liste des opérations
│   │   │   │   └── 📁 edit/     # Édition d'opérations
│   │   │   ├── 📁 summary/      # Résumés financiers
│   │   │   └── 📁 users/        # Gestion utilisateurs
│   │   ├── 📁 lib/              # Utilitaires et config
│   │   └── 📁 providers/        # Providers React
│   ├── 📁 types/                # Types TypeScript
│   └── 📁 middleware.ts         # Middleware Next.js
├── 📁 public/                   # Assets statiques
└── 📄 Configuration files       # Config Next.js, Tailwind, etc.
```

## 🔧 Installation et Configuration

### Prérequis
- Node.js 18+ 
- PostgreSQL (ou Supabase)
- npm ou yarn

### Installation

1. **Cloner le projet**
```bash
git clone [url-du-repo]
cd elengi_water-financier
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configuration de l'environnement**
```bash
# Copier le fichier d'exemple
cp .env.example .env.local

# Configurer les variables d'environnement
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="votre-secret"
NEXTAUTH_URL="http://localhost:3000"
```

4. **Configuration de la base de données**
```bash
# Générer le client Prisma
npx prisma generate

# Appliquer les migrations
npx prisma migrate dev

# (Optionnel) Seeder les données initiales
npm run seed
```

5. **Lancer l'application**
```bash
npm run dev
```

L'application sera accessible sur `http://localhost:3000`

## 🎯 Utilisation

### 👤 Pour les Utilisateurs

1. **Connexion** : Accédez à `/login` pour vous connecter
2. **Dashboard** : Consultez votre tableau de bord personnel
3. **Nouvelle opération** : 
   - Allez dans "Nouvelle opération"
   - Remplissez le formulaire (montant, catégorie, type, description)
   - Validez pour enregistrer
4. **Liste des opérations** :
   - Allez dans "Liste des opérations"
   - Consultez toutes vos transactions
   - Modifiez ou supprimez des opérations
5. **Consulter les résumés** :
   - **Jour** : Vue détaillée du jour en cours
   - **Semaine** : Synthèse de la semaine
   - **Mois** : Vue d'ensemble mensuelle

### 👨‍💼 Pour les Administrateurs

1. **Gestion des utilisateurs** : Créer, modifier, supprimer des comptes
2. **Gestion des catégories** : Créer, modifier, supprimer des catégories
3. **Accès complet** : Toutes les fonctionnalités utilisateur
4. **Supervision** : Vue d'ensemble de tous les utilisateurs

## 🔌 API Endpoints

### Opérations
- `GET /api/operations` - Récupérer toutes les opérations (avec pagination)
- `POST /api/operations` - Créer une nouvelle opération
- `GET /api/operations/[id]` - Récupérer une opération spécifique
- `PUT /api/operations/[id]` - Mettre à jour une opération
- `DELETE /api/operations/[id]` - Supprimer une opération
- `GET /api/operations/summary/day` - Résumé journalier
- `GET /api/operations/summary/week` - Résumé hebdomadaire  
- `GET /api/operations/summary/month` - Résumé mensuel

### Catégories
- `GET /api/categories` - Liste des catégories
- `POST /api/categories` - Créer une nouvelle catégorie (ADMIN)
- `GET /api/categories/[id]` - Récupérer une catégorie spécifique (ADMIN)
- `PUT /api/categories/[id]` - Mettre à jour une catégorie (ADMIN)
- `DELETE /api/categories/[id]` - Supprimer une catégorie (ADMIN)

### Utilisateurs
- `GET /api/users` - Liste des utilisateurs (ADMIN)
- `GET /api/users/[id]` - Détails d'un utilisateur
- `POST /api/users` - Créer un utilisateur

### Authentification
- `GET /api/auth/signin` - Page de connexion
- `GET /api/auth/signout` - Déconnexion

## 🔒 Sécurité

- **Authentification** : NextAuth.js avec sessions sécurisées
- **Validation** : Zod pour la validation des données
- **Hachage** : Mots de passe hachés avec bcrypt
- **CORS** : Configuration sécurisée des requêtes
- **Middleware** : Protection des routes sensibles
- **Autorisation** : Vérification que l'utilisateur possède l'opération
- **Rôles** : Accès admin requis pour la gestion des catégories

## 📊 Fonctionnalités Avancées

### 🔄 Calculs Automatiques
À chaque nouvelle opération, modification ou suppression, le système :
1. Enregistre/modifie/supprime l'opération dans la base
2. Met à jour automatiquement les résumés (jour/semaine/mois)
3. Calcule les totaux et soldes en temps réel

### 🏷️ Gestion Intelligente des Catégories
- **Protection des données** : Empêche la suppression de catégories utilisées
- **Validation des noms** : Vérification de l'unicité des noms de catégories
- **Types de catégories** : Distinction automatique revenus/dépenses
- **Impact des modifications** : Alertes lors de la modification de catégories utilisées

### 📈 Visualisation des Données
- **Cartes de résumé** : Affichage clair des totaux
- **Listes détaillées** : Historique complet des opérations
- **Indicateurs visuels** : Couleurs pour distinguer revenus/dépenses
- **Actions rapides** : Boutons modifier/supprimer sur chaque élément

### 🎨 Interface Adaptative
- **Responsive design** : Optimisé mobile/desktop
- **Thème sombre/clair** : Adaptation automatique
- **Navigation intuitive** : Sidebar avec icônes
- **Feedback utilisateur** : Messages de confirmation et erreurs

## 🚀 Déploiement

### Vercel (Recommandé)
```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
vercel
```

### Autres Plateformes
- **Netlify** : Compatible avec Next.js
- **Railway** : Déploiement simple avec base de données
- **Docker** : Containerisation possible

## 🛠️ Développement

### Scripts Disponibles
```bash
npm run dev          # Développement local
npm run build        # Build de production
npm run start        # Démarrer en production
npm run lint         # Vérification du code
npm run seed         # Seeder la base de données
```

### Ajout de Nouvelles Fonctionnalités
1. **Nouvelle API Route** : Créer dans `src/app/api/`
2. **Nouveau composant** : Ajouter dans `src/app/components/`
3. **Nouvelle page** : Créer dans `src/app/dashboard/`
4. **Migration DB** : `npx prisma migrate dev`

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📝 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 📞 Support

Pour toute question ou problème :
- Ouvrir une issue sur GitHub
- Contacter l'équipe de développement
- Consulter la documentation technique

---

**Elengi Water** - Gestion financière moderne et intuitive 💧
