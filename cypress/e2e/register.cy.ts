describe('E2E-REG-01 → 05 - Register Component (minimal)', () => {
    it('should create (E2E-REG-01)', () => {
        cy.visit('/register');
        cy.get('app-register').should('exist');
    });

    it('should display error messages and not call backend on submit with invalid data (E2E-REG-02)', () => {
        cy.intercept('POST', '/api/register').as('registerRequest');
        
        cy.visit('/register');
        cy.contains('button','Register').click(); // Submit the form

        cy.get('.invalid-feedback').should('have.length', 4); // Check if the error messages are displayed
        cy.get('form').should('have.class', 'ng-submitted'); // Check if the form has been submitted
        cy.get('@registerRequest.all').should('have.length', 0); // Check that the backend was not called
        cy.url().should('include', '/register'); // Check if the user is still on the register page
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
        cy.contains('button', 'Register').click();
      
        cy.fixture('register-user').then((user) => {
          cy.wait('@registerRequest').its('request.body').should('deep.equal', user);
        });
      
        cy.url().should('include', '/login');
    });

    it('should navigate to /login on click "Je me connecte" link (E2E-REG-04)', () => {
        cy.visit('/register');
        cy.contains('a', 'Je me connecte').click();
        cy.url().should('include', '/login');
    });

    it('should reset the form on click "Cancel" button (E2E-REG-05)', () => {
        cy.visit('/register');
        cy.fillRegisterForm(); // Fill the form with valid data
        cy.contains('button','Cancel').click();
        // Check that the form has been reset
        cy.get('input[formControlName="firstName"]').should('be.empty');
        cy.get('input[formControlName="lastName"]').should('be.empty');
        cy.get('input[formControlName="login"]').should('be.empty');
        cy.get('input[formControlName="password"]').should('be.empty');
    });
});