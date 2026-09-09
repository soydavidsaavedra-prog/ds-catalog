import { expect, test } from "@playwright/test";
import { TEST_OWNER_EMAIL, TEST_OWNER_PASSWORD, TEST_TENANT_SLUG } from "./setup/constants";

test.describe("login", () => {
  test("rejects a wrong password with a generic error", async ({ page }) => {
    await page.goto("/acceder");
    await page.fill("#email", TEST_OWNER_EMAIL);
    await page.fill("#password", "not-the-real-password");
    await page.getByRole("button", { name: "Ingresar" }).click();

    await expect(page.getByText("Correo o contraseña incorrectos.")).toBeVisible();
    // Never redirected — still on /acceder.
    await expect(page).toHaveURL(/\/acceder/);
  });

  test("logs the tenant owner in and lands on their own admin panel", async ({ page }) => {
    await page.goto("/acceder");
    await page.fill("#email", TEST_OWNER_EMAIL);
    await page.fill("#password", TEST_OWNER_PASSWORD);
    await page.getByRole("button", { name: "Ingresar" }).click();

    await expect(page).toHaveURL(new RegExp(`/${TEST_TENANT_SLUG}/admin`));
  });
});
