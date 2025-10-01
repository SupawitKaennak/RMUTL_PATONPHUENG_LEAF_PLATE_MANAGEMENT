import './commands'

Cypress.on('uncaught:exception', () => {
	// prevent Cypress from failing the test on frontend runtime warnings
	return false
})
