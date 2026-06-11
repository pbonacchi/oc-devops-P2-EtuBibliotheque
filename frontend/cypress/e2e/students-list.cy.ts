describe('E2E-STL-01 → 11 - Students List Component (minimal)', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
  });

  it('should create component & display students list when backend returns 200 (E2E-STL-01)', () => {
    cy.mockStudentsList();
    cy.openStudentList();
  
    cy.get('app-students-list').should('exist');    
    cy.get('[data-cy="students-list-item"]').should('have.length.at.least', 1); 
  });
  
  it('should display selection message when no student is selected (E2E-STL-02)', () => {
    cy.mockStudentsList();
    cy.openStudentList();
  
    cy.get('[data-cy="student-details-selection-message"]').should('exist');
  });

  it('should display selected student details when clicking a student in the list (E2E-STL-03)', () => {
    cy.mockStudentsList();
    cy.openStudentList();

    cy.fixture('students.json').then((students) => {
      const selected = students[0];
  
      // Clique sur le 1er étudiant de la liste
      cy.get('[data-cy="students-list-item"]').first().click();
  
      // Le message "aucune sélection" doit disparaître
      cy.get('[data-cy="student-details-selection-message"]').should('not.exist');
  
      // Vérifie le panneau de détails (mode lecture)
      cy.get('[data-cy="student-details-title"]').should('contain', selected.id);
      cy.get('[data-cy="student-details-firstname"]').should('contain', selected.firstName);
      cy.get('[data-cy="student-details-lastname"]').should('contain', selected.lastName);
      cy.get('[data-cy="student-details-login"]').should('contain', selected.login);
  
      // Actions attendues en mode lecture
      cy.get('[data-cy="student-details-edit-button"]').should('be.visible');
      cy.get('[data-cy="student-details-delete-button"]').should('be.visible');
    });
  });

  it('should display an empty creation form when clicking the "Ajouter un étudiant" button (E2E-STL-04)', () => {
    cy.mockStudentsList();
    cy.openStudentList();
  
    cy.get('[data-cy="add-student-button"]').click();
    cy.get('[data-cy="student-details-creation-form"]').should('be.visible');
    cy.get('[data-cy="student-details-creation-form"] input[formControlName="firstName"]').should('be.empty');
    cy.get('[data-cy="student-details-creation-form"] input[formControlName="lastName"]').should('be.empty');
    cy.get('[data-cy="student-details-creation-form"] input[formControlName="login"]').should('be.empty');
  });

  it('should create a new student and display it in the list when submitting the creation form (E2E-STL-05)', () => {
    cy.fixture('student-created.json').then((student) => {
      const createPayload = {
        firstName: student.firstName,
        lastName: student.lastName,
        login: student.login,
      };

      cy.intercept('POST', '/api/students', {
        statusCode: 201,
        body: student,
      }).as('createStudent');

      cy.mockStudentsList();
      cy.openStudentList();
      cy.get('[data-cy="students-list-item"]').its('length').then((countBefore) => {
        cy.get('[data-cy="add-student-button"]').click();

        cy.get('[data-cy="student-details-creation-form"] input[formControlName="firstName"]').type(createPayload.firstName);
        cy.get('[data-cy="student-details-creation-form"] input[formControlName="lastName"]').type(createPayload.lastName);
        cy.get('[data-cy="student-details-creation-form"] input[formControlName="login"]').type(createPayload.login);
        cy.get('[data-cy="student-details-creation-form-submit-button"]').click();

        cy.wait('@createStudent').its('request.body').should('deep.equal', createPayload);

        cy.get('[data-cy="students-list-item"]').should('have.length', countBefore + 1);
        cy.get('[data-cy="students-list-item"]').last().should('contain', student.firstName).and('contain', student.lastName);
        // pas nécessaire ici: visible que si user sélectionné, pas requis ds ce test
        // cy.get('[data-cy="student-details-title"]').should('contain', student.id);
        // cy.get('[data-cy="student-details-login"]').should('contain', student.login);
      });
    });
  });

  it('should hide creation form when clicking the "Annuler" button (E2E-STL-06)', () => {
    cy.mockStudentsList();
    cy.openStudentList();

    cy.get('[data-cy="add-student-button"]').click();
    cy.get('[data-cy="student-details-creation-form"]').should('be.visible');
    cy.get('[data-cy="student-details-creation-form-cancel-button"]').click();
    cy.get('[data-cy="student-details-creation-form"]').should('not.exist');
  });

  it('should edit an existing student and display the changes in the list and details panel when submitting the editform (E2E-STL-07)', () => {
    cy.fixture('students.json').then((students) => {
      const editedStudent = students[0];
      const editPayload = {
        firstName: `${editedStudent.firstName} edited`,
        lastName: `${editedStudent.lastName} edited`,
        login: `${editedStudent.login} edited`,
      };
      const updatedStudent = { ...editedStudent, ...editPayload };

      cy.mockStudentsList();
      cy.intercept('PUT', `**/api/students/${editedStudent.id}`, { statusCode: 200, body: updatedStudent }).as('editStudent');

      cy.openStudentList();
      cy.get('[data-cy="students-list-item"]').its('length').then((countBefore) => {
        cy.get('[data-cy="students-list-item"]').first().click();
        cy.get('[data-cy="student-details-edit-button"]').click();

        cy.get('[data-cy="student-details-edit-form"]').should('be.visible');
        cy.get('[data-cy="student-details-edit-form"] input[formControlName="firstName"]').clear().type(editPayload.firstName);
        cy.get('[data-cy="student-details-edit-form"] input[formControlName="lastName"]').clear().type(editPayload.lastName);
        cy.get('[data-cy="student-details-edit-form"] input[formControlName="login"]').clear().type(editPayload.login);
        cy.get('[data-cy="student-details-edit-form-submit-button"]').click();
        
        cy.wait('@editStudent').its('request.body').should('deep.equal', updatedStudent);

        cy.get('[data-cy="students-list-item"]').should('have.length', countBefore);
        cy.get('[data-cy="students-list-item"]').first().should('contain', updatedStudent.firstName).and('contain', updatedStudent.lastName);
        cy.get('[data-cy="student-details-title"]').should('contain', updatedStudent.id);
        cy.get('[data-cy="student-details-firstname"]').should('contain', updatedStudent.firstName);
        cy.get('[data-cy="student-details-lastname"]').should('contain', updatedStudent.lastName);
        cy.get('[data-cy="student-details-login"]').should('contain', updatedStudent.login);
      });
    });
  });

  it('should hide edit form when clicking the "Annuler" button (E2E-STL-08)', () => {
    cy.mockStudentsList();
    cy.openStudentList();

    cy.get('[data-cy="students-list-item"]').first().click();
    cy.get('[data-cy="student-details-edit-button"]').click();
    cy.get('[data-cy="student-details-edit-form"]').should('be.visible');
    cy.get('[data-cy="student-details-edit-form-cancel-button"]').click();
    cy.get('[data-cy="student-details-edit-form"]').should('not.exist');
  });
  
  it('should delete a student and remove it from the list and details panel when submitting the deletion form (E2E-STL-09)', () => {
    cy.fixture('students.json').then((students) => {
      const deletedStudent = students[0];
      cy.mockStudentsList();
      cy.intercept('DELETE', `**/api/students/${deletedStudent.id}`, { statusCode: 204 }).as('deleteStudent');

      cy.openStudentList();
      cy.get('[data-cy="students-list-item"]').its('length').then((countBefore) => {
        cy.get('[data-cy="students-list-item"]').first().click();
        cy.get('[data-cy="student-details-delete-button"]').click();

        cy.wait('@deleteStudent');

        cy.get('[data-cy="students-list-item"]')
          .should('have.length', countBefore - 1)
          .and('not.contain', deletedStudent.firstName)
          .and('not.contain', deletedStudent.lastName);
        cy.get('[data-cy="student-details-title"]').should('not.exist');
        cy.get('[data-cy="student-details-firstname"]').should('not.exist');
        cy.get('[data-cy="student-details-lastname"]').should('not.exist');
        cy.get('[data-cy="student-details-login"]').should('not.exist');
        cy.get('[data-cy="student-details-feedback-message"]').should('contain', 'Student deleted successfully');
      });
    });
  });

  it('should display error message when backend returns 400 on create student and not add it to the list (E2E-STL-10)', () => {
    cy.fixture('student-created.json').then((student) => {
      const createPayload = {
        firstName: student.firstName,
        lastName: student.lastName,
        login: student.login,
      };

      cy.intercept('POST', '/api/students', {
        statusCode: 400,
        body: { message: 'Bad request' },
      }).as('createStudent');

      cy.mockStudentsList();
      cy.openStudentList();
      cy.get('[data-cy="students-list-item"]').its('length').then((countBefore) => {
        cy.get('[data-cy="add-student-button"]').click();
        cy.get('[data-cy="student-details-creation-form"]').should('be.visible');
        cy.get('[data-cy="student-details-creation-form"] input[formControlName="firstName"]').type(createPayload.firstName);
        cy.get('[data-cy="student-details-creation-form"] input[formControlName="lastName"]').type(createPayload.lastName);
        cy.get('[data-cy="student-details-creation-form"] input[formControlName="login"]').type(createPayload.login);
        cy.get('[data-cy="student-details-creation-form-submit-button"]').click();

        cy.wait('@createStudent');
        cy.get('[data-cy="student-details-feedback-message"]').should('contain', 'Error creating student: Bad request');
        cy.get('[data-cy="students-list-item"]')
          .should('have.length', countBefore)
          .and('not.contain', createPayload.firstName)
          .and('not.contain', createPayload.lastName);
      });
    });
  });

  it('should create component & display an empty list when backend returns 400 (E2E-STL-11)', () => {
    cy.intercept('GET', '/api/students', {
      statusCode: 400,
      body: { message: 'Bad request' },
    }).as('getStudents');

    cy.openStudentList();
    cy.get('[data-cy="students-list"]').should('be.empty');
  });

});