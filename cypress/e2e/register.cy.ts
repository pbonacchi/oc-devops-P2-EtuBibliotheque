describe('E2E-REG-01 → 05 - Register Component (minimal)', () => {
    it('should create component & display form (E2E-REG-01)', () => {
        cy.visit('/register');
        cy.get('app-register').should('exist');
        cy.get('form[data-cy="register-form"]').should('be.visible');
    });

    it('should display error messages and not call backend on submit with invalid data (E2E-REG-02)', () => {
        cy.intercept('POST', '/api/register').as('registerRequest');
        
        cy.visit('/register');
        cy.get('button[data-cy="register-button"]').click(); // Submit the form

        cy.get('[data-cy="register-form"]').should('have.class', 'ng-submitted'); // Check if the form has been submitted
        cy.get('@registerRequest.all').should('have.length', 0); // Check that the backend was not called
        cy.url().should('include', '/register'); // Check if the user is still on the register page
        cy.get('[data-cy="invalid-input-firstName"]').should('be.visible'); // Check if the error messages are displayed
        cy.get('[data-cy="invalid-input-lastName"]').should('be.visible'); // Check if the error messages are displayed
        cy.get('[data-cy="invalid-input-login"]').should('be.visible'); // Check if the error messages are displayed
        cy.get('[data-cy="invalid-input-password"]').should('be.visible'); // Check if the error messages are displayed
    });

    it('should submit valid form, call POST /api/register and navigate to /login (E2E-REG-03)', () => {
        cy.intercept('POST', '/api/register', {
            statusCode: 201,
            body: { message: 'created' },
        }).as('registerRequest');
      
        cy.on('window:alert', (text) => {
            expect(text).to.eq('SUCCESS!! :-)');
        });
      
        cy.visit('/register');
        cy.fillRegisterForm(); // Fill the form with valid data
        cy.get('[data-cy="register-button"]').click();
      
        cy.fixture('register-user').then((user) => {
          cy.wait('@registerRequest').its('request.body').should('deep.equal', user);
        });
      
        cy.url().should('include', '/login');
    });

    it('should navigate to /login on click "Je me connecte" link (E2E-REG-04)', () => {
        cy.visit('/register');
        cy.get('[data-cy="login-link"]').click();
        cy.url().should('include', '/login');
    });

    it('should reset the form on click "Cancel" button (E2E-REG-05)', () => {
        cy.visit('/register');
        cy.fillRegisterForm(); // Fill the form with valid data
        cy.get('[data-cy="cancel-button"]').click();
        // Check that the form has been reset
        cy.get('input[formControlName="firstName"]').should('be.empty');
        cy.get('input[formControlName="lastName"]').should('be.empty');
        cy.get('input[formControlName="login"]').should('be.empty');
        cy.get('input[formControlName="password"]').should('be.empty');
    });
});