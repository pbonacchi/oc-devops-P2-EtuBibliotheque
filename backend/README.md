# MS etudiant-backend

Backend Spring Boot qui expose les APIs d'authentification JWT, d'inscription et de gestion des étudiants de la bibliothèque (CRUD).

## Prérequis et environnement

| Paramètre | Valeur |
|---|---|
| Nom de l'application | `etudiant-backend` |
| Port HTTP | `8080` |
| Java | 21 |
| Spring Boot | 3.5.5 |

### Pré-requis pour le bon fonctionnement du service :

    -> JDK 21
    -> Docker
    -> Docker Compose
    -> Maven 3.9.3 (https://archive.apache.org/dist/maven/maven-3/3.9.3/binaries/) ou plus

### Variables d'environnement

Le fichier `.env` à la racine du projet est chargé automatiquement via `spring.config.import` (voir `src/main/resources/application.yml`). Créez-le à partir du modèle ci-dessous si nécessaire :

```properties
DB_USER=etudiant_db
DB_PASSWORD=etudiant_db
DB_HOST=localhost
DB_PORT=3306
DB_NAME=etudiant_db

JWT_SECRET=<clé secrète pour signer les JWT>
DEFAULT_PASSWORD=<mot de passe par défaut assigné aux étudiants créés par un admin>
```

| Variable | Usage |
|---|---|
| `DB_*` | Connexion MySQL (Docker Compose en local) |
| `JWT_SECRET` | Signature des tokens JWT |
| `DEFAULT_PASSWORD` | Mot de passe initial des étudiants créés via `POST /api/students` |

## Démarrage du backend
Pour démarrer le projet backend, il faut : 
- avoir démarré Docker-Desktop sur votre poste de travail local.
- dans une console, se placer à la racine du projet et exécuter la commande Maven suivante :
```
mvn spring-boot:run
```

Cette commande va : 
 - initialiser le container Docker qui contient la base de données (MySQL défini dans `compose.yaml`)
 - lancer le serveur du backend et le connecter à la base de données précédemment créée
 - créer ou mettre à jour le schéma JPA (`ddl-auto: update`)

Les traces logs devraient ressembler à ceci : 
```
.   ____          _            __ _ _
/\\ / ___'_ __ _ _(_)_ __  __ _ \ \ \ \
( ( )\___ | '_ | '_| | '_ \/ _` | \ \ \ \
\\/  ___)| |_)| | | | | || (_| |  ) ) ) )
'  |____| .__|_| |_|_| |_\__, | / / / /
=========|_|==============|___/=/_/_/_/

:: Spring Boot ::                (v3.5.5)

[etudiant-backend] [           main] c.o.etudiant.EtudiantBackendApplication  : Starting EtudiantBackendApplication using Java 21.0.3 with PID 6964
[etudiant-backend] [           main] c.o.etudiant.EtudiantBackendApplication  : No active profile set, falling back to 1 default profile: "default"
[etudiant-backend] [           main] .s.b.d.c.l.DockerComposeLifecycleManager : Using Docker Compose file ******etudiant-backend\compose.yaml*****
[etudiant-backend] [utReader-stderr] o.s.boot.docker.compose.core.DockerCli   :  Container etudiant-backend-mysql-1  Created
[etudiant-backend] [utReader-stderr] o.s.boot.docker.compose.core.DockerCli   :  Container etudiant-backend-mysql-1  Starting
[etudiant-backend] [utReader-stderr] o.s.boot.docker.compose.core.DockerCli   :  Container etudiant-backend-mysql-1  Started
[etudiant-backend] [utReader-stderr] o.s.boot.docker.compose.core.DockerCli   :  Container etudiant-backend-mysql-1  Waiting
[etudiant-backend] [utReader-stderr] o.s.boot.docker.compose.core.DockerCli   :  Container etudiant-backend-mysql-1  Healthy
[etudiant-backend] [           main] .s.d.r.c.RepositoryConfigurationDelegate : Bootstrapping Spring Data JPA repositories in DEFAULT mode.
[etudiant-backend] [           main] .s.d.r.c.RepositoryConfigurationDelegate : Finished Spring Data repository scanning in 39 ms. Found 1 JPA repository interface.
[etudiant-backend] [           main] o.s.b.w.embedded.tomcat.TomcatWebServer  : Tomcat initialized with port 8080 (http)
[etudiant-backend] [           main] o.apache.catalina.core.StandardService   : Starting service [Tomcat]
[etudiant-backend] [           main] o.apache.catalina.core.StandardEngine    : Starting Servlet engine: [Apache Tomcat/10.1.44]
[etudiant-backend] [           main] o.a.c.c.C.[Tomcat].[localhost].[/]       : Initializing Spring embedded WebApplicationContext
[etudiant-backend] [           main] w.s.c.ServletWebServerApplicationContext : Root WebApplicationContext: initialization completed in 1354 ms
[etudiant-backend] [           main] o.hibernate.jpa.internal.util.LogHelper  : HHH000204: Processing PersistenceUnitInfo [name: default]
[etudiant-backend] [           main] org.hibernate.Version                    : HHH000412: Hibernate ORM core version 6.6.26.Final
[etudiant-backend] [           main] o.h.c.internal.RegionFactoryInitiator    : HHH000026: Second-level cache disabled
[etudiant-backend] [           main] o.s.o.j.p.SpringPersistenceUnitInfo      : No LoadTimeWeaver setup: ignoring JPA class transformer
[etudiant-backend] [           main] com.zaxxer.hikari.HikariDataSource       : HikariPool-1 - Starting...
[etudiant-backend] [           main] com.zaxxer.hikari.pool.HikariPool        : HikariPool-1 - Added connection com.mysql.cj.jdbc.ConnectionImpl@4db16677
[etudiant-backend] [           main] com.zaxxer.hikari.HikariDataSource       : HikariPool-1 - Start completed.
[etudiant-backend] [           main] org.hibernate.orm.connections.pooling    : HHH10001005: Database info:
[etudiant-backend] [           main] o.h.e.t.j.p.i.JtaPlatformInitiator       : HHH000489: No JTA platform available (set 'hibernate.transaction.jta.platform' to enable JTA platform integration)
[etudiant-backend] [           main] j.LocalContainerEntityManagerFactoryBean : Initialized JPA EntityManagerFactory for persistence unit 'default'
[etudiant-backend] [           main] JpaBaseConfiguration$JpaWebConfiguration : spring.jpa.open-in-view is enabled by default. Therefore, database queries may be performed during view rendering. Explicitly configure spring.jpa.open-in-view to disable this warning
[etudiant-backend] [           main] o.s.b.a.e.web.EndpointLinksResolver      : Exposing 1 endpoint beneath base path '/actuator'
[etudiant-backend] [           main] eAuthenticationProviderManagerConfigurer : Global AuthenticationManager configured with AuthenticationProvider bean with name authenticationProvider
[etudiant-backend] [           main] r$InitializeUserDetailsManagerConfigurer : Global AuthenticationManager configured with an AuthenticationProvider bean. UserDetailsService beans w
ill not be used by Spring Security for automatically configuring username/password login. Consider removing the AuthenticationProvider bean. Alternatively, consider using the UserDetailsService in a manually instantiated DaoAuth
enticationProvider. If the current configuration is intentional, to turn off this warning, increase the logging level of 'org.springframework.security.config.annotation.authentication.configuration.InitializeUserDetailsBeanManagerConfigurer' to ERROR
[etudiant-backend] [           main] o.s.b.w.embedded.tomcat.TomcatWebServer  : Tomcat started on port 8080 (http) with context path '/'
[etudiant-backend] [           main] c.o.etudiant.EtudiantBackendApplication  : Started EtudiantBackendApplication in 10.27 seconds (process running for 10.642)
```

Sur Docker-Desktop, vous devriez voir apparaître un container MySQL qui correspond au projet.

![1-docker-desktop](pictures/1-docker-desktop.png)

Vous pouvez vous connecter à la base de données et vérifier que la table ```user``` a été créée automatiquement.
Pour cela, cliquez sur le lien `mysql-1` ce qui vous amènera sur la vue complète de la base de données. 
Dans l'onglet ```Exec```, il faut : 

1. se connecter à la base de données. Tapez la commande ci-dessous

    ```
    mysql -u etudiant_db -p
    ```
   L'invite de commande demandera le mot de passe. Il est identique au nom d'utilisateur, c'est-à-dire ```etudiant_db```.


2. Se connecter au schéma de base de données `etudiant_db`. Dans l'invite de commande, tapez la commande ci-dessous :

    ```
    use etudiant_db;
    ```
  
3. Vérifier que la table `user` existe (elle est néanmoins vide pour le moment).

    ```
    select * from user;
    ```
    Le résultat devrait être : `Empty set (0.00 sec)`

La capture d'écran ci-dessous résume les étapes précédentes : 

![2-docker-desktop-bdd](pictures/2-docker-desktop-bdd.png)

## APIs exposées

| Méthode | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/register` | Non | Inscription d'un étudiant (mot de passe fourni dans le corps) |
| `POST` | `/api/login` | Non | Authentification → retourne un JWT |
| `POST` | `/api/students` | Oui | Création d'un étudiant par un admin (mot de passe par défaut) |
| `GET` | `/api/students` | Oui | Liste des étudiants |
| `GET` | `/api/students/{id}` | Oui | Détail d'un étudiant |
| `PUT` | `/api/students/{id}` | Oui | Mise à jour d'un étudiant |
| `DELETE` | `/api/students/{id}` | Oui | Suppression d'un étudiant |

Les endpoints marqués « Oui » dans la colonne Auth nécessitent un header `Authorization: Bearer <token>` (JWT obtenu via `POST /api/login`).

Les réponses JSON utilisent le camelCase (`createdAt`, `updatedAt`) ; en base MySQL, les colonnes correspondantes sont `created_at` et `updated_at`, renseignées automatiquement côté serveur.

## Exécution des tests
Pour exécuter les tests Junit, il faut :
- avoir démarré Docker-Desktop sur votre poste de travail local. Cette étape est nécessaire car les tests d'intégration auront besoin de Docker pour créer des bases de données temporaires de test.
- dans une console, se placer à la racine du projet et exécuter la commande Maven suivante :

```
./mvnw verify
```

Cette commande :
- exécute l'ensemble des tests (58 au total : unitaires + intégration) ;
- génère le rapport de couverture JaCoCo dans `target/site/jacoco/` (non versionné) ;
- vérifie le seuil de couverture **≥ 80 %** configuré dans `pom.xml` (phase `jacoco:check`).

Pour exécuter les tests et générer le rapport **sans** vérifier le seuil : `./mvnw test`.

Pour le détail des scénarios de test, des exclusions JaCoCo et des critères d'acceptation, voir [README_QA.md](README_QA.md).

## Intégration continue

Un workflow GitHub Actions (`.github/workflows/ci.yml`) exécute `./mvnw verify` à chaque push sur `main` et sur chaque pull request. Le rapport JaCoCo est publié en résumé du job et en artefact téléchargeable.

## Stack technique

- Spring Boot 3.5 (Web, Security, Data JPA, Validation, Actuator)
- MySQL + Docker Compose (dev) / Testcontainers (tests)
- JWT (jjwt)
- MapStruct, Lombok
- JaCoCo, JUnit 5, Mockito, AssertJ
