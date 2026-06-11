describe('E2E-GUA-01 → 04 - Security (AuthGuard+session)', () => {
    beforeEach(() => {
        cy.clearLocalStorage();
    });

    it('should redirect to /login with returnUrl when visiting /ma-bibli (protected page) and user is not authenticated (E2E-GUA-01)', () => {
        cy.visit('/ma-bibli');
        cy.location().should((loc) => {
            expect(loc.pathname).to.eq('/login');
            expect(new URLSearchParams(loc.search).get('returnUrl')).to.eq('/ma-bibli');
        });
    });

    it('should redirect to /login with returnUrl when visiting /students (protected page) and user is not authenticated (E2E-GUA-02)', () => {
        cy.visit('/students');
        cy.location().should((loc) => {
            expect(loc.pathname).to.eq('/login');
            expect(new URLSearchParams(loc.search).get('returnUrl')).to.eq('/students');
        });
    });

    it('should display /students page when user is authenticated (E2E-GUA-03)', () => {
        cy.mockStudentsList();
      
        cy.visit('/login');
        cy.setAuthSession();
        cy.visit('/students');
      
        cy.url().should('include', '/students');
        cy.get('app-students-list').should('exist');
      });

    it('should send authorization header with JWT token in GET /api/students (E2E-GUA-04)', () => {
        cy.fixture('token.json').then((token) => {
            cy.intercept('GET', '/api/students', (req) => {
                req.reply({ fixture: 'students.json' });
            }).as('getStudents');

            cy.visit('/login');
            cy.setAuthSession(token);
            cy.visit('/students');

            cy.wait('@getStudents').then((interception) => {
                expect(interception.request.headers['authorization']).to.eq(
                    `Bearer ${token.idToken}`
                );
            });
        });
    });
});