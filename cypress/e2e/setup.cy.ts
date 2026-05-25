describe('E2E-SETUP-01->03 - Configuration Cypress & Fixtures', () => {
    it('should load the application via baseUrl', () => {
        cy.visit('/');
        cy.contains('PUBLIC home page').should('be.visible');
    });

    it('should access /ma-bibli with a mocked session', () => {
        cy.visit('/login'); // une page pour avoir un origin et accéder à localStorage
        cy.setAuthSession();
        cy.visit('/ma-bibli');
        cy.contains('ma-bibli works!').should('be.visible');
    });

    it('should login via the form with a mocked API', () => {
        cy.loginByApi();
        cy.url().should('include', '/ma-bibli');
    });
});

