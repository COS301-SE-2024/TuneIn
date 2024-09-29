import { test } from "./fixtures";

test("logs in", async ({ loggedInPage }) => {
	await loggedInPage.goto("http://localhost:8081/screens/Home");
	await
});

// test('get started link', async ({ page }) => {
//   await page.goto('https://playwright.dev/');

//   // Click the get started link.
//   await page.getByRole('link', { name: 'Get started' }).click();

//   // Expects page to have a heading with the name of Installation.
//   await expect(page.getByRole('heading', { name: 'Installation' })).toBeVisible();
// });
