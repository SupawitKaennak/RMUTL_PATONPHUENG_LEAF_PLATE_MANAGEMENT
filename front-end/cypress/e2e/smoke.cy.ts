describe('Full smoke suite', () => {
	beforeEach(() => {
		// Cache the login across tests using cy.session (Cypress v12+)
		const username = (Cypress.env('ADMIN_USER') as string) || 'admin'
		const password = (Cypress.env('ADMIN_PASS') as string) || 'admin123'
		cy.session([username, password], () => {
			cy.visit('/login')
			cy.get('input[type="text"], input[name*="user" i], input[autocomplete="username"], input[placeholder*="user" i]')
				.first()
				.clear()
				.type(username)
			cy.get('input[type="password"], input[name*="pass" i], input[autocomplete="current-password"], input[placeholder*="pass" i]')
				.first()
				.clear()
				.type(password)
			cy.contains('button, [role="button"]', /เข้าสู่ระบบ|Login/i).first().click({ force: true })
			cy.getCookie('authToken').should('exist')
		})
	})

	after(() => {
		// Optional: logout once if endpoint available
		cy.logout()
	})

	it('loads home', () => {
		cy.visit('/')
		cy.contains(/(แดชบอร์ด|RMUTL|Leaf)/i)
	})

	it('materials page renders and lists table', () => {
		cy.visit('/materials')
		cy.contains(/วัตถุดิบ|Materials/i)
		cy.get('table, [role="table"]').should('exist')
	})

	it('orders page renders', () => {
		cy.visit('/orders')
		cy.contains(/ออเดอร์|Orders/i)
		cy.get('table, [role="table"]').should('exist')
	})

	it('income-expense page renders', () => {
		cy.visit('/income-expense')
		cy.contains(/รายรับ|รายจ่าย|Income|Expense/i)
	})

	it('reports page renders', () => {
		cy.visit('/reports')
		cy.contains(/รายงาน|Reports/i)
	})
})
