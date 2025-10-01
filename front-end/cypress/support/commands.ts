declare global {
	namespace Cypress {
		interface Chainable {
			login(username: string, password: string): Chainable<void>
			logout(): Chainable<void>
		}
	}
}

Cypress.Commands.add('login', (username?: string, password?: string) => {
	const u = username || (Cypress.env('ADMIN_USER') as string)
	const p = password || (Cypress.env('ADMIN_PASS') as string)
	if (!u || !p) {
		throw new Error('Missing ADMIN_USER/ADMIN_PASS. Set via cypress.env.json or environment variables.')
	}
	cy.request({
		method: 'GET',
		url: '/api/auth/csrf',
		withCredentials: true,
	}).then(() => {
		cy.request({
			method: 'POST',
			url: '/api/auth/login',
			body: { username: u, password: p },
			withCredentials: true,
		})
	})
})

Cypress.Commands.add('logout', () => {
	cy.request({ method: 'POST', url: '/api/auth/logout', withCredentials: true })
})

export {}
