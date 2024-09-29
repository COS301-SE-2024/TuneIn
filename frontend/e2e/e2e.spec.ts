import { test } from "./fixtures";
import { expect } from "@playwright/test";

test("renders home page", async ({ loggedInPage }) => {
	await loggedInPage.goto("http://localhost:8081/screens/Home");

	// Wait for the network to be idle to ensure all requests are finished
	await loggedInPage.waitForLoadState("networkidle");

	// Assert that the text "Student1" is visible
	await expect(loggedInPage.getByText("Picks for you")).toBeVisible();
});

test("renders profile page", async ({ loggedInPage }) => {
	await loggedInPage.goto("http://localhost:8081/screens/profile/ProfilePage");

	// Wait for the network to be idle to ensure all requests are finished
	await loggedInPage.waitForLoadState("networkidle");

	// Assert that the text "Student1" is visible
	await expect(loggedInPage.getByText("Student1")).toBeVisible();
});


test("edits user info", async ({ loggedInPage, cleanupProfile }) => {
	await loggedInPage.goto("http://localhost:8081/screens/profile/ProfilePage");

	// Wait for the network to be idle to ensure all requests are finished
	await loggedInPage.waitForLoadState("networkidle");

	loggedInPage.getByText("Edit").click();

	// Assert that the text "Student1" is visible
	await expect(loggedInPage.getByText("Edit Profile")).toBeVisible();

	await loggedInPage.getByPlaceholder("Enter name here").fill("User1");

	// await loggedInPage.getByPlaceholder("Enter username here").fill("e2e");

	await loggedInPage.getByPlaceholder("Enter bio here").fill("This is a test");

	await loggedInPage.getByText("Add link").click();

	await loggedInPage.getByRole("textbox").nth(4).fill("twitter.com/test");

	await loggedInPage.getByText("Add +").click();

	await loggedInPage.getByTestId("genre-search-query").fill("jazz");

	await loggedInPage.getByTestId("jazz-genre-option").click();

	await loggedInPage.getByTestId("close-button").click();

	await loggedInPage.getByText("Save").click();

	await loggedInPage.waitForLoadState("networkidle");

	await expect(loggedInPage.getByText("User1")).toBeVisible();
	// await expect(loggedInPage.getByText("e2e")).toBeVisible();
	await expect(loggedInPage.getByText("This is a test")).toBeVisible();
	await expect(loggedInPage.getByText("jazz")).toBeVisible();

	// Call the cleanup fixture explicitly
	await cleanupProfile();
});
