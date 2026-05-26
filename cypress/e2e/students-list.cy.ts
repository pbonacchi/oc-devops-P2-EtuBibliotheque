describe('E2E-STL-01 → 09 - Students List Component (minimal)', () => {
    beforeEach(() => {
        cy.clearLocalStorage();
    });

    it('should create component & display students list (E2E-STL-01)', () => {
        cy.mockStudentsList();
      
        cy.visit('/login');
        cy.setAuthSession();
        cy.visit('/students');
      
        cy.get('app-students-list').should('exist');    
        cy.get('[data-cy="students-list"] li').should('have.length.at.least', 1); 
    });
    
      
});