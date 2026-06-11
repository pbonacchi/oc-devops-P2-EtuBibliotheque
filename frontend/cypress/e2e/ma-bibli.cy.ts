describe('E2E-MA-01 → 02 - Ma Bibli Component', () => {
    beforeEach(() => {
        cy.clearLocalStorage();
    });

    it('should display /ma-bibli page when user is authenticated (E2E-MA-01)', () => {
        cy.visit('/login');
        cy.setAuthSession();
        cy.visit('/ma-bibli');
        cy.url().should('include', '/ma-bibli');
        cy.get('app-ma-bibli').should('exist');
        cy.get('button[data-cy="logout-button"]').should('be.visible');
    });

    it('should clear localStorage and redirect to / when logging out (E2E-MA-02)', () => {
        cy.visit('/login');
        cy.setAuthSession();

        cy.visit('/ma-bibli');
        cy.get('button[data-cy="logout-button"]').click();

        cy.window().its('localStorage').should('be.empty');
        cy.url().should('include', '/');
        cy.get('app-home').should('exist');
        cy.get('[data-cy="home-content"]').should('be.visible');
    });
});