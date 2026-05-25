describe('E2E-SETUP-01->03 - Configuration Cypress & Fixtures', () => {
    it('devrait charger l’application via baseUrl', () => {
        cy.visit('/');
        cy.contains('PUBLIC home page').should('be.visible');
    });

    it('devrait accéder à /ma-bibli avec une session mockée', () => {
        cy.visit('/login'); // une page pour avoir un origin et accéder à localStorage
        cy.setAuthSession();
        cy.visit('/ma-bibli');
        cy.contains('ma-bibli works!').should('be.visible');
    });

    it('devrait se connecter via le formulaire avec API mockée', () => {
        cy.loginByApi();
        cy.url().should('include', '/ma-bibli');
    });
});

