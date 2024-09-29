// fixtures.ts
import { test as base } from "@playwright/test";
import dotenv from "dotenv";
import fs from "fs";
dotenv.config();

// Extend base test
export const test = base.extend<{
	loggedInPage: any;
}>({
	loggedInPage: async ({ browser }, use) => {
		let context;

		// Check if the auth state exists
		if (fs.existsSync("authState.json")) {
			// Load the session from the saved auth state
			context = await browser.newContext({ storageState: "authState.json" });
		} else {
			// If auth state doesn't exist, perform login and save the state
			context = await browser.newContext();
			const page = await context.newPage();

			await page.goto("http://localhost:8081/screens/WelcomeScreen");

			const [popup] = await Promise.all([
				context.waitForEvent("page"),
				page.click("text=Login With Spotify"),
			]);

			await popup.waitForLoadState();
			await popup.fill(
				"input#login-username",
				process.env.SPOTIFY_USERNAME || "",
			);
			await popup.fill(
				"input#login-password",
				process.env.SPOTIFY_PASSWORD || "",
			);
			await popup.click("button#login-button");

			await page.waitForURL("http://localhost:8081/screens/Home");

			// Save the storage state to reuse in future tests
			await context.storageState({ path: "authState.json" });
		}

		// Create a new page using the authenticated context
		const loggedInPage = await context.newPage();
		await use(loggedInPage);

		await context.close();
	},
});
