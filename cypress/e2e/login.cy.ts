describe('E2E-LOG-01 → 05 - Login Component (minimal)', () => {
    beforeEach(() => {
        cy.clearLocalStorage();
    });

    it('should create component & display form (E2E-LOG-01)', () => {
        cy.visit('/login');
        cy.get('app-login').should('exist');
        cy.get('app-login').should('contain', 'Login Form');
    });

    it('should display error messages and not call backend (destination /ma-bibli) on submit with invalid data (E2E-LOG-02)', () => {
        cy.intercept('POST', '/api/login').as('loginRequest');

        cy.visit('/login');
        cy.contains('button','Login').click(); // Submit the form

        cy.get('.invalid-feedback').should('have.length', 2); // Check if the error messages are displayed
        cy.get('form').should('have.class', 'ng-submitted'); // Check if the form has been submitted
        cy.get('@loginRequest.all').should('have.length', 0); // Check that the backend was not called
        cy.url().should('include', '/login'); // Check if the user is still on the login page
    });

    it('should submit valid form with valid credentials, call POST /api/login, display success message and navigate to /ma-bibli if successful (E2E-LOG-03)', () => {
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
        cy.contains('button', 'Login').click();
      
        // 5. Vérifier l'appel API + le body
        cy.fixture('login-user').then((user) => {
          cy.wait('@loginRequest').its('request.body').should('deep.equal', user);
        });
      
        // 6. Message de succès (pas d'erreur)
        cy.get('.alert-success')
          .should('be.visible')
          .and('contain', 'Authentification réussie');
        cy.get('.alert-danger').should('not.exist');
      
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
        cy.contains('button','Login').click();
        cy.wait('@loginRequest');
        cy.url().should('include', '/login');
        cy.get('.alert-danger').should('be.visible');
        cy.get('.alert-success').should('not.exist');
    });

    it('should navigate to /register on click "Je crée un compte" link (E2E-REG-05)', () => {
        cy.visit('/login');
        cy.contains('a', 'Je crée un compte').click();
        cy.url().should('include', '/register');
    });

    it('should reset the form on click "Cancel" button (E2E-LOG-06)', () => {
        cy.visit('/login');
        cy.fillLoginForm(); // Fill the form with valid data
        cy.contains('button','Cancel').click();
        // Check that the form has been reset
        cy.get('input[formControlName="login"]').should('be.empty');
        cy.get('input[formControlName="password"]').should('be.empty');
    });
});
