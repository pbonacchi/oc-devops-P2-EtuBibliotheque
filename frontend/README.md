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

## Scripts npm

| Commande | Usage |
| --- | --- |
| `npm start` | Serveur de développement |
| `npm run build` | Build production |
| `npm test` | Tests unitaires Jest + couverture (`coverage/`) |
| `npm run test:watch` | Jest en mode interactif |
| `npm run test:ci` | Pipeline CI : unitaires Jest + E2E Cypress avec couverture |
| `npm run e2e:open` | Cypress interactif (lancer `npm start` dans un autre terminal) |
| `npm run e2e:ci` | E2E headless (démarre le serveur automatiquement) |
| `npm run e2e:coverage` | E2E + rapport de couverture (`coverage-e2e/`) |
| `npm run e2e:coverage:open` | Cypress interactif avec code instrumenté |
| `npm run e2e:coverage:report` | Régénère le rapport E2E après une session `e2e:coverage:open` |

## Tests

### Tests unitaires (Jest)

```bash
npm test
npm run test:watch
```

**État actuel :** 11 suites, 76 tests — couverture ~97 % (lignes), objectif projet ≥ 80 % atteint.

Fichiers de test : `src/**/*.spec.ts` (composants, services, guard, interceptor).

### Tests E2E (Cypress)

Les tests E2E mockent les appels API via `cy.intercept` ; le backend n'est pas requis.

```bash
npm run e2e:ci          # headless, serveur démarré automatiquement
npm run e2e:open        # interface Cypress (npm start requis à part)
npm run e2e:coverage    # headless + rapport de couverture E2E
```

Scénarios dans `cypress/e2e/` : accueil, login, register, garde d'authentification, liste étudiants, parcours complets.

### Pipeline complet (comme en CI)

```bash
npm run test:ci
```

## Intégration continue

Le workflow **CI Frontend** (push/pull request sur `main` ou `master`) exécute Jest puis Cypress avec couverture sous Node.js 22. Les rapports HTML sont publiés en artefacts (`coverage-jest`, `coverage-e2e`). En cas d'échec Cypress, les captures d'écran et vidéos sont également conservées.

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
