// fixtures.ts
import { test as base, expect } from "@playwright/test";
import auth from "../app/services/AuthManagement";
import dotenv from "dotenv";
import fs from "fs";
dotenv.config();

// Extend base test
export const test = base.extend<{
	loggedInPage: any;
	cleanupProfile: () => Promise<void>;
}>({
	loggedInPage: async ({ browser }, use) => {
		let context;

		// Check if the auth state exists
		// if (fs.existsSync("authState.json")) {
		// 	// Load the session from the saved auth state
		// 	context = await browser.newContext({ storageState: "authState.json" });
		// } else {
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
		// await context.storageState({ path: "authState.json" });
		// }

		// Create a new page using the authenticated context
		const loggedInPage = await context.newPage();
		await use(loggedInPage);

		await context.close();
	},
	
	cleanupProfile: async ({ loggedInPage }, use) => {
		await use(async () => {
			// Perform the profile cleanup
			await loggedInPage.goto("http://localhost:8081/screens/profile/ProfilePage");
			await loggedInPage.waitForLoadState("networkidle");

			// Edit profile and reset the fields
			await loggedInPage.getByText("Edit").click();
			await expect(loggedInPage.getByText("Edit Profile")).toBeVisible();

			// Restore the original values
			await loggedInPage.getByPlaceholder("Enter name here").fill("Student1");
			await loggedInPage.getByPlaceholder("Enter bio here").fill("");

			// Remove the link and genre added during the test
			await loggedInPage.getByTestId("twitter.com/test-close").click();
			await loggedInPage.getByTestId("jazz-genre-close").click();

			// Save the updated profile
			await loggedInPage.getByText("Save").click();
			await loggedInPage.waitForLoadState("networkidle");

			// Verify that the cleanup was successful
			await expect(loggedInPage.getByText("Student1")).toBeVisible();
			await expect(loggedInPage.getByText("This is a test")).not.toBeVisible();
			await expect(loggedInPage.getByText("jazz")).not.toBeVisible();
		});
	},
});
