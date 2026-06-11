# EtuBibliothèque

Application full-stack de gestion des étudiants abonnés à une bibliothèque : **Spring Boot** (API REST + JWT) et **Angular** (interface web).

## Structure du dépôt

| Dossier | Stack | Port local |
| --- | --- | --- |
| [`backend/`](backend/) | Java 21, Spring Boot 3.5, MySQL | `8080` |
| [`frontend/`](frontend/) | Angular 19, Jest, Cypress | `4200` |

## Démarrage rapide

### 1. Backend

```bash
cd backend
# Créer backend/.env (voir backend/README.md)
./mvnw spring-boot:run
```

Docker est requis : MySQL est démarré automatiquement via `compose.yaml`.

### 2. Frontend

```bash
cd frontend
npm ci
npm start
```

Ouvrir [http://localhost:4200](http://localhost:4200). Le proxy Angular redirige `/api` vers `http://localhost:8080`.

## Tests

| Partie | Commande | Couverture minimale |
| --- | --- | --- |
| Backend | `cd backend && ./mvnw verify` | ≥ 80 % (JaCoCo) |
| Frontend unitaires | `cd frontend && npm test` | ≥ 80 % (Jest) |
| Frontend E2E | `cd frontend && npm run e2e:coverage` | ≥ 80 % (Cypress) |

Détails des scénarios : [`backend/README_QA.md`](backend/README_QA.md) et [`frontend/README-QA.md`](frontend/README-QA.md).

## Intégration continue

Deux workflows GitHub Actions à la racine, déclenchés uniquement sur les fichiers modifiés :

| Workflow | Déclencheur | Actions |
| --- | --- | --- |
| [CI Backend](.github/workflows/ci-backend.yml) | `backend/**` | `./mvnw verify` + rapport JaCoCo |
| [CI Frontend](.github/workflows/ci-frontend.yml) | `frontend/**` | Jest + Cypress avec couverture |

## Documentation détaillée

- [Backend — installation, API, variables d'environnement](backend/README.md)
- [Frontend — routes, scripts npm, structure](frontend/README.md)
