describe('E2E-STL-01 → 09 - Students List Component (minimal)', () => {
    beforeEach(() => {
        cy.clearLocalStorage();
    });

    it('should create component & display students list (E2E-STL-01)', () => {
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

    /*it('should create a new student and display it in the list when submitting the creation form (E2E-STL-05)', () => {
        cy.mockStudentsList();
        cy.openStudentList();
      
        cy.get('[data-cy="add-student-button"]').click();
        cy.get('[data-cy="student-details-creation-form"] input[formControlName="firstName"]').type('John');
        cy.get('[data-cy="student-details-creation-form"] input[formControlName="lastName"]').type('Doe');
        cy.get('[data-cy="student-details-creation-form"] input[formControlName="login"]').type('john.doe');
        cy.get('[data-cy="student-details-creation-form"] button[type="submit"]').click();
    });*/
      
});