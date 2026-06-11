# README QA - Etudiant Backend

## Contexte et objectif

Ce document formalise le plan de tests et le rapport de couverture pour le backend `etudiant-backend`.

Il couvre l'ensemble des suites de tests implémentées :

- **Tests unitaires** : `UserService`, `JwtService`, `CustomUserDetailService`, `JwtAuthenticationFilter`, `RestExceptionHandler`
- **Tests d'intégration** : `UserController` (chaîne HTTP complète + MySQL via Testcontainers)

Objectif principal : vérifier la qualité fonctionnelle et technique du socle utilisateur (authentification JWT, inscription, CRUD étudiant, gestion des erreurs HTTP), puis piloter l'atteinte du critère projet de couverture **>= 80 %** (instructions, hors exclusions JaCoCo).

## Périmètre (scope)

### Ce qui est testé

| Classe testée | Fichier de test | Type | Focus |
|---|---|---|---|
| `UserService` | `UserServiceTest` | Unitaire | Logique métier (register, login, CRUD) avec mocks |
| `JwtService` | `JwtServiceTest` | Unitaire | Génération, extraction, validation et expiration JWT |
| `CustomUserDetailService` | `CustomUserDetailServiceTest` | Unitaire | Chargement `UserDetails` (trouvé / absent) |
| `JwtAuthenticationFilter` | `JwtAuthenticationFilterTest` | Unitaire | Filtre Bearer, branches d'erreur, `SecurityContext` |
| `RestExceptionHandler` | `RestExceptionHandlerTest` | Unitaire | Réponses HTTP d'erreur (400, 401, 403, 500) |
| `UserController` | `UserControllerTest` | Intégration | API REST, sécurité, validation DTO, persistance MySQL |

Couverture indirecte (sans test dédié) : `SpringSecurityConfig`, `RequestLoggingFilterConfig`, `UserDtoMapperImpl` — exercés via le contexte Spring des tests d'intégration et/ou la chaîne métier.

### Ce qui n'est pas (ou partiellement) testé

- `SpringSecurityConfig` : pas de tests unitaires dédiés (configuration de filtres et règles d'autorisation)
- Scénarios de charge, E2E front-back, résilience/chaos
- Classes exclues du rapport JaCoCo (voir [section dédiée](#exclusions-jacoco-périmètre-du-calcul)) : pas d'objectif de couverture directe sur ces artefacts

### Hors périmètre

- Performance / load tests
- Tests E2E front-back
- Résilience / chaos

## Objectifs de test

- Valider la conformité fonctionnelle des opérations utilisateur
- Vérifier les règles métier (unicité login, existence id, validation des champs)
- Vérifier le cycle de vie JWT (génération, validation, expiration, signature)
- Vérifier l'authentification par filtre HTTP et le chargement utilisateur Spring Security
- Vérifier la gestion centralisée des erreurs et les codes HTTP attendus
- Vérifier l'intégration entre composants applicatifs et la base
- Limiter les régressions sur les parcours critiques

## Stratégie de test

### 1) Tests unitaires (service, sécurité, handler)

- Isolation via mocks (Mockito) ou instanciation directe (`JwtService`, `RestExceptionHandler`)
- `ReflectionTestUtils` pour injecter le secret et l'expiration JWT (`JwtServiceTest`), ou le mot de passe par défaut (`UserServiceTest`, champ `@Value`)
- Token JWT expiré construit directement via `Jwts.builder()` (sans `Thread.sleep`) dans `JwtServiceTest`
- `MockHttpServletRequest` / `MockHttpServletResponse` pour le filtre JWT
- Frameworks : JUnit 5, Mockito, AssertJ
- Vérification des interactions (`verify`) et des exceptions fonctionnelles

### 2) Tests d'intégration (controller)

- `@SpringBootTest` + `@AutoConfigureMockMvc`
- Tests HTTP réels via `MockMvc`
- Base MySQL réelle via Testcontainers (Docker requis)
- Peu/pas de mocks applicatifs (comportement proche production)
- Validation de la persistance en base après appels API

## Environnement de test

- OS execution : Linux
- JDK : 21
- Build : Maven
- Framework : Spring Boot 3.5.5
- Base de données de test : MySQL (Testcontainers 2.0.3)
- Sécurité : Spring Security + JWT
- Couverture : JaCoCo 0.8.15 (seuil 80 % configuré dans `pom.xml`, version héritée du parent Spring Boot)
- Configuration de test : `src/test/resources/application.yml` (`DEFAULT_PASSWORD`, secret JWT factice) + `@DynamicPropertySource` dans `UserControllerTest` (datasource Testcontainers)

## Données de test

- Jeux valides :
  - utilisateurs complets (`firstName`, `lastName`, `login`, `password`)
  - étudiants valides pour create/update (`createStudent` : mot de passe par défaut via `DEFAULT_PASSWORD`)
  - tokens JWT signés avec secret de test (Base64)
- Jeux invalides / erreurs :
  - champs manquants, payload vides, JSON malformé
  - login déjà existant, id inexistant, mot de passe invalide
  - token JWT malformé, expiré ou signé avec une autre clé
  - header `Authorization` absent ou non Bearer
  - requêtes non authentifiées
- Données limites :
  - `null` (tests unitaires)
  - DTO vides (tests intégration)

## Inventaire des tests

### Synthèse par classe

| Classe de test | Nb tests | Préfixe ID |
|---|---:|---|
| `UserServiceTest` | 19 | `UT-US-*` |
| `JwtServiceTest` | 8 | `UT-JS-*` |
| `CustomUserDetailServiceTest` | 2 | `UT-CUDS-*` |
| `JwtAuthenticationFilterTest` | 4 | `UT-JAF-*` |
| `RestExceptionHandlerTest` | 4 | `UT-REH-*` |
| `UserControllerTest` | 21 | `IT-UC-*` |
| **Total** | **58** | |

### Cas de test (vue synthétique)

| ID | Type | Description | Résultat attendu |
|---|---|---|---|
| **UserService** (`UT-US-*`) | | | |
| UT-US-REG-01..03 | Unitaire | register succès / user null / login existant | save ou `IllegalArgumentException` |
| UT-US-LOG-01..05 | Unitaire | login succès / login null / password null / login inconnu / password invalide | token ou `IllegalArgumentException` |
| UT-US-CRT-01..03 | Unitaire | createStudent nominal / null / doublon | save ou exception |
| UT-US-GETALL-01 | Unitaire | getAllStudents | liste retournée |
| UT-US-GETID-01..02 | Unitaire | getById nominal / absent | Optional ou exception |
| UT-US-UPD-01..03 | Unitaire | update nominal / dto null / id absent | save ou exception |
| UT-US-DEL-01..02 | Unitaire | delete nominal / id absent | delete ou exception |
| **JwtService** (`UT-JS-*`) | | | |
| UT-JS-GEN-01 | Unitaire | generateToken avec `UserDetails` valide | token non vide, login extrait |
| UT-JS-GET-01..02 | Unitaire | getUsernameFromToken valide / invalide | login ou `JwtException` |
| UT-JS-VAL-01..04 | Unitaire | validateToken valide / malformé / expiré / mauvaise signature | OK ou `JwtException` |
| UT-JS-EXP-01 | Unitaire | getExpiration | valeur configurée |
| **CustomUserDetailService** (`UT-CUDS-*`) | | | |
| UT-CUDS-01 | Unitaire | loadUserByUsername — login existant | `UserDetails` retourné |
| UT-CUDS-02 | Unitaire | loadUserByUsername — login absent | `UsernameNotFoundException` |
| **JwtAuthenticationFilter** (`UT-JAF-*`) | | | |
| UT-JAF-DFI-01 | Unitaire | Bearer valide | authentification dans `SecurityContext`, filtre poursuivi |
| UT-JAF-DFI-02 | Unitaire | header Authorization absent | pas d'appel JWT, contexte vide |
| UT-JAF-EXT-01 | Unitaire | header non Bearer (ex. Basic) | pas d'authentification |
| UT-JAF-DFI-03 | Unitaire | validation JWT en échec | exception absorbée, chaîne poursuivie |
| **RestExceptionHandler** (`UT-REH-*`) | | | |
| UT-REH-01 | Unitaire | JSON malformé | 400 + `ErrorDetails` |
| UT-REH-02 | Unitaire | identifiants invalides | 401 + `ErrorDetails` |
| UT-REH-03 | Unitaire | accès refusé | 403 + `ErrorDetails` |
| UT-REH-04 | Unitaire | exception non gérée | 500 + message générique |
| **UserController** (`IT-UC-*`) | | | |
| IT-UC-REG-01..03 | Intégration | POST /api/register | 201 / 400 |
| IT-UC-LOG-01..03 | Intégration | POST /api/login | 200 / 400 |
| IT-UC-CRT-01..03 | Intégration | POST /api/students | 201 / 401 / 400 |
| IT-UC-GETALL-01..02 | Intégration | GET /api/students | 200 / 401 |
| IT-UC-GETID-01..03 | Intégration | GET /api/students/{id} | 200 / 400 / 401 |
| IT-UC-UPD-01..04 | Intégration | PUT /api/students/{id} | 200 / 400 / 401 |
| IT-UC-DEL-01..03 | Intégration | DELETE /api/students/{id} | 204 / 400 / 401 |

## Outils utilisés

- JUnit 5
- Mockito
- AssertJ
- Spring Boot Test / MockMvc
- Spring Security Test (`@WithMockUser`)
- Testcontainers (MySQL)
- Maven Surefire
- JaCoCo
- GitHub Actions (CI)

## Intégration continue

Un workflow GitHub Actions (`.github/workflows/ci.yml`) exécute `./mvnw verify` à chaque push sur `main` et sur chaque pull request :

- exécution des 58 tests (Docker requis pour Testcontainers) ;
- vérification du seuil JaCoCo **≥ 80 %** ;
- publication d'un résumé de couverture dans l'onglet **Summary** du job ;
- dépôt du rapport HTML en artefact **`jacoco-report`** (14 jours de rétention).

Les rapports JaCoCo ne sont **pas versionnés** dans Git (`target/` ignoré).

## Rapport de couverture

### Génération

JaCoCo est intégré au cycle Maven (`prepare-agent`, `report`, `check`).

Générer le rapport HTML (sans vérifier le seuil) :

```bash
./mvnw test
```

Rapport HTML local : `target/site/jacoco/index.html`

Exécuter les tests **et** vérifier le seuil 80 % (échoue si non atteint) :

```bash
./mvnw verify
```

### Exclusions JaCoCo (périmètre du calcul)

Les exclusions suivantes sont configurées dans `pom.xml` (phases `report` et `check`) :

| Exclusion | Raison (synthétique) |
|---|---|
| `*Application*` | Point d'entrée Spring Boot sans logique métier testable |
| `dto/**` | Objets de transfert (validation déclarative, couverts indirectement par les tests controller) |
| `entities/**` | Modèle JPA / `UserDetails` — getters, mapping et persistance validés via service et intégration |
| `handler/ErrorDetails.class` | POJO de réponse d'erreur ; structure vérifiée dans `RestExceptionHandlerTest`, pas de logique à isoler |

Ces exclusions visent à mesurer la couverture du **code applicatif exécutable** plutôt que des artefacts génériques ou déjà validés indirectement.

### Résultats (dernier rapport généré)

> Chiffres issus de `target/site/jacoco/jacoco.csv` après `./mvnw verify` du 2026-06-09 — 58 tests, 9 classes analysées (hors exclusions JaCoCo).

**Couverture globale :**

| Métrique | Valeur |
|---|---|
| Instructions | **99 %** (850/857) |
| Branches | **84 %** (22/26) |
| Lignes | **196/200** (98 %) |

**Résultats de tests :**

| Classe de test | Tests | Échecs |
|---|---:|---:|
| `UserServiceTest` | 19 | 0 |
| `JwtServiceTest` | 8 | 0 |
| `CustomUserDetailServiceTest` | 2 | 0 |
| `JwtAuthenticationFilterTest` | 4 | 0 |
| `RestExceptionHandlerTest` | 4 | 0 |
| `UserControllerTest` | 21 | 0 |
| **Total** | **58** | **0** |

**Couverture par package (principaux) :**

| Package | Instructions |
|---|---|
| `controller` | 100 % |
| `service` | 100 % |
| `configuration.security` | 100 % |
| `handler` (`RestExceptionHandler`) | 100 % |
| `mapper` | 93 % (DTO null non testés) |
| `configuration.logging` | 100 % |

## Critères d'acceptation

- Tous les tests exécutés sans échec
- Aucune régression critique sur parcours login/register/CRUD et sécurité JWT
- Rapport de couverture généré localement ou en artefact CI (non versionné dans Git)
- Seuil projet : **>= 80 %** de couverture globale (instructions, bundle JaCoCo avec exclusions)

**État actuel vs seuil :**

- **99 % ≥ 80 %** → critère global **atteint** (sur périmètre JaCoCo configuré)

## Critères d'entrée / sortie

### Entrée

- Code compilable
- Environnement Docker actif (tests d'intégration `UserControllerTest`)
- Dépendances Maven résolues

### Sortie

- 58 tests exécutés (37 unitaires + 21 intégration)
- Rapports Surefire et JaCoCo générés dans `target/` (local) ou artefact CI
- Seuil JaCoCo `./mvnw verify` validé (local ou pipeline GitHub Actions)
