describe('E2E-FLOW-01 → 02 - End to End User Journey', () => {
    beforeEach(() => {
        cy.clearLocalStorage();
    });

    // 1. Student journey : register, login, display protected page, logout and back to home page
    it('should register a new user, login, display /ma-bibli page, logout and back to home page (E2E-FLOW-01)', () => {
        cy.intercept('POST', '/api/register', {
            statusCode: 201,
            body: { message: 'created' },
        }).as('registerRequest');
      
        cy.intercept('POST', '/api/login', {
            statusCode: 200,
            fixture: 'token.json',
        }).as('loginRequest');

        cy.on('window:alert', (text) => {
            expect(text).to.eq('SUCCESS!! :-)');
        });
        
        cy.visit('/register');
        cy.fillRegisterForm();
        cy.get('[data-cy="register-button"]').click();
        cy.url().should('include', '/login');
        cy.fillLoginForm();
        cy.get('[data-cy="login-button"]').click();
        cy.url().should('include', '/ma-bibli');
        cy.get('button[data-cy="logout-button"]').click();
        cy.url().should('include', '/');
    });

    // 2. Admin journey: login, display students list, add/modify/delete students, logout and back to home page
    it('should visit /students while being not authenticated, be redirected to login page, login, display /students and add/modify/delete a student (E2E-FLOW-02)', () => {
        cy.fixture('student-created.json').then((student) => {
            const createPayload = {
                firstName: student.firstName,
                lastName: student.lastName,
                login: student.login,
            };
            const editPayload = {
                firstName: `${student.firstName} edited`,
                lastName: `${student.lastName} edited`,
                login: `${student.login} edited`,
            };
            const updatedStudent = { ...student, ...editPayload };

            cy.intercept('POST', '/api/login', {
                statusCode: 200,
                fixture: 'token.json',
            }).as('loginRequest');
            cy.mockStudentsList();
            cy.intercept('POST', '/api/students', {
                statusCode: 201,
                body: student,
            }).as('createStudent');
            cy.intercept('PUT', `**/api/students/${student.id}`, {
                statusCode: 200,
                body: updatedStudent,
            }).as('updateStudent');
            cy.intercept('DELETE', `**/api/students/${student.id}`, {
                statusCode: 204,
            }).as('deleteStudent');

            cy.visit('/students');
            cy.url().should('include', '/login');
            cy.fillLoginForm();
            cy.get('[data-cy="login-button"]').click();
            cy.url().should('include', '/students');
            cy.get('app-students-list').should('exist');
            cy.get('[data-cy="students-list-item"]').its('length').then((countBefore) => {
                // Create a new student
                cy.get('[data-cy="add-student-button"]').click();
                cy.get('[data-cy="student-details-creation-form"] input[formControlName="firstName"]').type(createPayload.firstName);
                cy.get('[data-cy="student-details-creation-form"] input[formControlName="lastName"]').type(createPayload.lastName);
                cy.get('[data-cy="student-details-creation-form"] input[formControlName="login"]').type(createPayload.login);
                cy.get('[data-cy="student-details-creation-form-submit-button"]').click();
                cy.wait('@createStudent');
                cy.get('[data-cy="students-list-item"]').should('have.length', countBefore + 1);
                cy.get('[data-cy="students-list-item"]').last().should('contain', createPayload.firstName).and('contain', createPayload.lastName);
                // Edit the new student
                //cy.get('[data-cy="students-list-item"]').first().click();
                //cy.get('[data-cy="students-list-item"]').last().click();
                cy.get('[data-cy="student-details-edit-button"]').click();
                cy.get('[data-cy="student-details-edit-form"] input[formControlName="firstName"]').clear().type(editPayload.firstName);
                cy.get('[data-cy="student-details-edit-form"] input[formControlName="lastName"]').clear().type(editPayload.lastName);
                cy.get('[data-cy="student-details-edit-form"] input[formControlName="login"]').clear().type(editPayload.login);
                cy.get('[data-cy="student-details-edit-form-submit-button"]').click();
                cy.wait('@updateStudent');
                cy.get('[data-cy="students-list-item"]').should('have.length', countBefore + 1);
                cy.get('[data-cy="students-list-item"]').last().should('contain', editPayload.firstName).and('contain', editPayload.lastName);
                // Delete the new student
                cy.get('[data-cy="student-details-delete-button"]').click();
                cy.wait('@deleteStudent');
                cy.get('[data-cy="students-list-item"]').should('have.length', countBefore);
                cy.get('[data-cy="students-list-item"]').last().should('not.contain', editPayload.firstName).and('not.contain', editPayload.lastName);
            });
        });
    });
});