describe('E2E-HOM-01 → 03 - Home Component', () => { 
    it('should create component & display title and buttons (E2E-HOM-01)', () => {
        cy.visit('/');
        cy.get('app-home').should('exist');
        cy.get('[data-cy="home-content"]').should('be.visible');
    });

    it('should navigate to /register on click "Créer un compte" button (E2E-HOM-02)', () => {
        cy.visit('/');
        cy.get('[data-cy="create-account-button"]').click();
        cy.url().should('include', '/register');
    });

    it('should navigate to /login on click "Se connecter" button (E2E-HOM-03)', () => {
        cy.visit('/');
        cy.get('[data-cy="login-button"]').click();
        cy.url().should('include', '/login');
    });
});