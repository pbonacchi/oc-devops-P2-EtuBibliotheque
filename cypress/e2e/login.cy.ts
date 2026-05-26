describe('E2E-LOG-01 → 05 - Login Component (minimal)', () => {
    beforeEach(() => {
        cy.clearLocalStorage();
    });

    it('should create component & display form (E2E-LOG-01)', () => {
        cy.visit('/login');
        cy.get('app-login').should('exist');
        cy.get('form[data-cy="login-form"]').should('be.visible');
    });

    it('should display error messages, not call backend and no redirect on submit with invalid data (E2E-LOG-02)', () => {
        cy.intercept('POST', '/api/login').as('loginRequest');

        cy.visit('/login');
        cy.get('button[data-cy="login-button"]').click();

        cy.get('[data-cy="login-form"]').should('have.class', 'ng-submitted'); // Check if the form has been submitted
        cy.get('@loginRequest.all').should('have.length', 0); // Check that the backend was not called (no request sent)
        cy.url().should('include', '/login'); // Check if the user is still on the login page (no redirect)
        cy.get('[data-cy="invalid-input-login"]').should('be.visible'); // Check if error messages are displayed
        cy.get('[data-cy="invalid-input-password"]').should('be.visible'); // Check if error messages are displayed
    });

    it('should submit valid form with valid credentials, call POST /api/login, display success message and redirect to /ma-bibli if successful (E2E-LOG-03)', () => {
        // 1. Mock de l'API (format Token attendu par AuthService)
        cy.intercept('POST', '/api/login', {
          statusCode: 200,
          fixture: 'token.json',
        }).as('loginRequest');
      
        // 2. Page login
        cy.visit('/login');
      
        // 3. Remplir le formulaire
        cy.fillLoginForm();
      
        // 4. Submit
        cy.get('[data-cy="login-button"]').click();
      
        // 5. Vérifier l'appel API + le body
        cy.fixture('login-user').then((user) => {
          cy.wait('@loginRequest').its('request.body').should('deep.equal', user);
        });
      
        // 6. Message de succès (pas d'erreur)
        cy.get('[data-cy="success-message"]')
          .should('be.visible')
          .and('contain', 'Authentification réussie');
        cy.get('[data-cy="error-message"]').should('not.exist');
      
        // 7. Redirection après 2s (timeout > 2000)
        cy.url({ timeout: 5000 }).should('include', '/ma-bibli');
        cy.contains('ma-bibli works!').should('be.visible');
    });

    it('should submit valid form with invalid credentials, call POST /api/login, display error message and stay on login page if unsuccessful (E2E-LOG-04)', () => {
        cy.intercept('POST', '/api/login', {
            statusCode: 401,
            body: { message: 'Invalid credentials' },
        }).as('loginRequest');
        cy.visit('/login');
        cy.fillLoginForm({ login: 'invalid', password: 'invalid' }); // Fill the form with invalid data
        cy.get('[data-cy="login-button"]').click();
        cy.wait('@loginRequest');
        cy.url().should('include', '/login');
        cy.get('[data-cy="error-message"]').should('be.visible');
        cy.get('[data-cy="success-message"]').should('not.exist');
    });

    it('should navigate to /register on click "Je crée un compte" link (E2E-REG-05)', () => {
        cy.visit('/login');
        cy.get('[data-cy="create-account-link"]').click();
        cy.url().should('include', '/register');
    });

    it('should reset the form on click "Cancel" button (E2E-LOG-06)', () => {
        cy.visit('/login');
        cy.fillLoginForm(); // Fill the form with valid data
        cy.get('[data-cy="cancel-button"]').click();
        // Check that the form has been reset
        cy.get('input[formControlName="login"]').should('be.empty');
        cy.get('input[formControlName="password"]').should('be.empty');
    });
});
