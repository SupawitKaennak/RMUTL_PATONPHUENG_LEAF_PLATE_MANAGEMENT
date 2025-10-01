import { defineConfig } from "cypress";

export default defineConfig({
	e2e: {
		baseUrl: process.env.NEXT_PUBLIC_BASE_URL || "https://localhost",
		supportFile: "cypress/support/e2e.ts",
		retries: 1,
		setupNodeEvents() {
			// implement node event listeners here if needed
		},
	},
	video: true,
	screenshotsFolder: "cypress/screenshots",
	videosFolder: "cypress/videos",
});
