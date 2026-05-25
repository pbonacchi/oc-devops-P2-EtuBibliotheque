/// <reference types="cypress" />
/**
 * Commande 1 : cy.setAuthSession() — session sans passer par l’UI login
 * Utile pour tester /ma-bibli, /students, etc. sans retester la connexion à chaque fois.
 * L’app stocke dans localStorage (voir auth.service.ts) :
 * - id_token
 * - expires_at (timestamp JSON, expiration dans le futur)
 * @param token - Token à stocker dans localStorage
 */
Cypress.Commands.add('setAuthSession', (token?: { idToken: string; expiresIn: number }) => {
    cy.fixture('token.json').then((defaultToken) => {
        const auth = token ?? defaultToken;
        const expiresAt = Date.now() + auth.expiresIn * 1000;
        localStorage.setItem('id_token', auth.idToken ?? '');
        localStorage.setItem('expires_at', JSON.stringify(expiresAt));
    });
}); 

/**
 * Commande 2 : cy.loginByApi() — connexion « réaliste » avec mock
 * Pour les tests qui doivent vérifier le parcours login (formulaire + intercept)
 */
Cypress.Commands.add('loginByApi', () => {
    cy.intercept('POST', '/api/login', {
        statusCode: 200,
        fixture: 'token.json',
    }).as('loginRequest');
  
    cy.fixture('login-user').then((user) => {
        cy.visit('/login');
        cy.get('input[formControlName="login"]').type(user.login);
        cy.get('input[formControlName="password"]').type(user.password);
        cy.contains('button', 'Login').click();
    });
    cy.wait('@loginRequest');
    // La redirection arrive après ~2s dans l'app
    cy.wait(2000);
});

/**
 * Commande 3 : cy.mockStudentsList() — stub API students
 * Pour les tests qui manipulent /api/students (GET, POST, PUT, DELETE)
 */
Cypress.Commands.add('mockStudentsList', () => {
    cy.intercept('GET', '/api/students', { fixture: 'students.json' }).as('getStudents');
});

declare global {
    namespace Cypress {
        interface Chainable {
            setAuthSession(token?: { idToken: string; expiresIn: number }): Chainable<void>;
            loginByApi(): Chainable<void>;
            mockStudentsList(): Chainable<void>;
        }
    }
}