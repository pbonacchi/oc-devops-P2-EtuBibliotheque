# EtuBibliothèque — Frontend

Application Angular du projet **EtuBibliothèque** : inscription, authentification JWT et gestion d'étudiants (CRUD).

| Élément | Version / outil |
| --- | --- |
| Framework | Angular 19 |
| UI | Angular Material |
| Tests unitaires | Jest 29 + `jest-preset-angular` |
| Tests E2E | Cypress 15 |
| CI | GitHub Actions (`.github/workflows/ci.yml`) |

## Prérequis

- **Node.js** 22 (recommandé, aligné sur la CI)
- **npm** (avec `package-lock.json` pour `npm ci`)
- **Backend** accessible sur `http://localhost:8080` pour le développement local (proxy API configuré)

## Installation

```bash
npm ci
```

## Démarrage en développement

Lancer le serveur de développement (proxy `/api` → backend sur le port 8080) :

```bash
ng serve
# équivalent : npm start
```

Ouvrir [http://localhost:4200/](http://localhost:4200/). L'application se recharge automatiquement à chaque modification des sources.

## Routes principales

| Route | Composant | Accès |
| --- | --- | --- |
| `/` | `HomeComponent` | Public |
| `/register` | `RegisterComponent` | Public |
| `/login` | `LoginComponent` | Public |
| `/ma-bibli` | `MaBibliComponent` | Protégé (`AuthGuard`) |
| `/students` | `StudentsListComponent` + `StudentDetailsComponent` | Protégé (`AuthGuard`) |

## Build

```bash
npm run build
# équivalent : ng build
```

Les artefacts de production sont générés dans `dist/etudiant-frontend/`.

## Tests

### Tests unitaires (Jest)

```bash
npm test              # exécution unique + rapport de couverture HTML (dossier coverage/)
npm run test:watch    # mode interactif
```

**État actuel :** 11 suites, 76 tests — couverture ~97 % (lignes), objectif projet ≥ 80 % atteint.

Fichiers de test : `src/**/*.spec.ts` (composants, services, guard, interceptor).

### Tests E2E (Cypress)

Les tests E2E mockent les appels API via `cy.intercept` ; le backend n'est pas requis.

```bash
npm run e2e:open      # interface Cypress (serveur Angular à lancer séparément)
npm run e2e           # exécution headless (serveur requis sur http://127.0.0.1:4200)
npm run e2e:ci        # démarre Angular + lance Cypress (utilisé en CI)
```

Scénarios dans `cypress/e2e/` : accueil, login, register, garde d'authentification, liste étudiants, parcours complets.

### Pipeline complet (comme en CI)

```bash
npm run test:ci       # tests unitaires + E2E
```

## Intégration continue

Le workflow **CI Frontend** (push/pull request sur `main` ou `master`) exécute `npm run test:ci` sous Node.js 22. En cas d'échec Cypress, les captures d'écran et vidéos sont conservées en artefact.

## Structure du projet

```
src/app/
├── core/
│   ├── models/          # Login, Register, Student, Token
│   ├── security/        # AuthService, AuthGuard, AuthInterceptor
│   └── service/         # UserService (+ UserMockService)
├── pages/               # Home, Login, Register, MaBibli, StudentsList, StudentDetails
└── shared/              # MaterialModule
cypress/
├── e2e/                 # Scénarios E2E
├── fixtures/            # Données mock (token, étudiants, erreurs API)
└── support/             # Commandes Cypress personnalisées
```

## Documentation QA

Le plan de tests détaillé (cas unitaires, E2E, critères d'acceptation) est décrit dans [README-QA.md](./README-QA.md).

## Ressources

- [Angular CLI — référence des commandes](https://angular.dev/tools/cli)
- [Documentation Jest](https://jestjs.io/docs/getting-started)
- [Documentation Cypress](https://docs.cypress.io/)
