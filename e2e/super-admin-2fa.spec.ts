import { expect, test, type Page } from "@playwright/test";
import { TEST_SUPERADMIN_EMAIL, TEST_SUPERADMIN_PASSWORD } from "./setup/constants";
import { generateTotp } from "./setup/totp";

/**
 * Exercises the full 2FA lifecycle against the disposable Super Admin
 * test account from global-setup.ts — never the platform operator's real
 * account. generateTotp (e2e/setup/totp.ts, verified against RFC 4226's
 * official test vectors) computes a currently-valid code straight from
 * the base32 secret the enrollment screen shows, standing in for a real
 * authenticator app so this runs unattended — the secret is captured once
 * during activation and reused to mint fresh codes for the rest of the
 * suite, exactly like a real authenticator app would keep working.
 *
 * Single serial spec, not independent tests: each step depends on the
 * previous step's state (2FA on/off, which backup codes are still
 * unused), the same way a person actually clicking through this once
 * would.
 */
test.describe.serial("Super Admin two-factor authentication", () => {
  let secret: string;
  let backupCode: string;

  async function login(page: Page) {
    await page.goto("/acceder");
    await page.fill("#email", TEST_SUPERADMIN_EMAIL);
    await page.fill("#password", TEST_SUPERADMIN_PASSWORD);
    await page.getByRole("button", { name: "Ingresar" }).click();
  }

  test("logs in directly (no 2FA yet) and can reach Seguridad", async ({ page }) => {
    await login(page);
    await expect(page).toHaveURL(/\/superadmin/);

    await page.goto("/superadmin/seguridad");
    await expect(page.getByText("Desactivada")).toBeVisible();
  });

  test("activates 2FA: password confirm, secret + confirm code, reveal backup codes", async ({ page }) => {
    await login(page);
    await page.goto("/superadmin/seguridad");

    await page.getByRole("button", { name: "Activar" }).click();
    await page.fill("#enable-password", TEST_SUPERADMIN_PASSWORD);
    await page.getByRole("button", { name: "Continuar" }).click();

    secret = (await page.locator("p.font-mono").first().innerText()).replace(/\s/g, "");
    expect(secret).toMatch(/^[A-Z2-7]+$/);

    await page.fill("#confirm-code", generateTotp(secret));
    await page.getByRole("button", { name: "Confirmar" }).click();

    await expect(page.getByText("Verificación en dos pasos activada.")).toBeVisible();

    const codes = await page.locator("div.grid.grid-cols-2 span.select-all").allInnerTexts();
    expect(codes).toHaveLength(10);
    backupCode = codes[0]!.trim();

    await page.getByRole("button", { name: "Ya los guardé" }).click();
    await expect(page.getByText("Activada", { exact: true })).toBeVisible();
  });

  test("logging in now requires a code, rejects a wrong one, then accepts the real TOTP code", async ({ page }) => {
    await login(page);
    await expect(page.getByText("Código de verificación")).toBeVisible();

    await page.fill("#code", "000000");
    await page.getByRole("button", { name: "Verificar" }).click();
    await expect(page.getByText(/Código incorrecto/)).toBeVisible();

    await page.fill("#code", generateTotp(secret));
    await page.getByRole("button", { name: "Verificar" }).click();
    await expect(page).toHaveURL(/\/superadmin/);
  });

  test("falls back to a backup code when the authenticator app isn't available", async ({ page }) => {
    await login(page);
    await page.getByRole("button", { name: /código de respaldo/ }).click();
    await page.fill("#backupCode", backupCode);
    await page.getByRole("button", { name: "Verificar" }).click();
    await expect(page).toHaveURL(/\/superadmin/);
  });

  test("rejects that same backup code on a second attempt — single use only", async ({ page }) => {
    await login(page);
    await page.getByRole("button", { name: /código de respaldo/ }).click();
    await page.fill("#backupCode", backupCode);
    await page.getByRole("button", { name: "Verificar" }).click();
    await expect(page.getByText(/Código de respaldo inválido o ya usado/)).toBeVisible();
  });

  test("disables 2FA (via a fresh TOTP code) and restores direct login", async ({ page }) => {
    await login(page);
    await page.fill("#code", generateTotp(secret));
    await page.getByRole("button", { name: "Verificar" }).click();
    await expect(page).toHaveURL(/\/superadmin/);

    await page.goto("/superadmin/seguridad");
    await page.getByRole("button", { name: "Desactivar" }).click();
    await page.fill("#disable-password", TEST_SUPERADMIN_PASSWORD);
    await page.getByRole("button", { name: "Confirmar" }).click();
    await expect(page.getByText("Verificación en dos pasos desactivada.")).toBeVisible();

    await login(page);
    await expect(page).toHaveURL(/\/superadmin/);
  });
});
