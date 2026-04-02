describe('Equipment page', () => {
  it('opens equipment drawer when user clicks on table row', () => {
    cy.visit('/equipment')

    cy.contains('Оборудование').should('be.visible')
    cy.contains('Мониторинг состояния, эффективности и сервисного цикла оборудования').should(
      'be.visible'
    )

    cy.get('.el-table__body-wrapper tbody tr', { timeout: 10000 })
      .should('have.length.greaterThan', 0)
      .first()
      .click()

    cy.contains('Единица оборудования').should('be.visible')
    cy.get('.equipment-drawer').should('be.visible')
  })
})
