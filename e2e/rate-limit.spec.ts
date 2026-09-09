import { expect, test } from "@playwright/test";

/**
 * A throwaway identifier used ONLY here, never for a real account — see
 * lib/auth/login-rate-limit.ts's EMAIL_MAX_ATTEMPTS (5 failures / 15 min).
 * Deliberately distinct from TEST_OWNER_EMAIL so this test's failed
 * attempts can never lock out login.spec.ts's own legitimate login.
 */
const RATE_LIMIT_TEST_EMAIL = "e2e-ratelimit@ds-catalog-test.example";

test.describe("login rate limiting", () => {
  test("locks out an email after 5 failed attempts", async ({ page }) => {
    await page.goto("/acceder");

    for (let attempt = 1; attempt <= 5; attempt++) {
      await page.fill("#email", RATE_LIMIT_TEST_EMAIL);
      await page.fill("#password", `wrong-password-${attempt}`);
      await page.getByRole("button", { name: "Ingresar" }).click();
      await expect(page.getByText("Correo o contraseña incorrectos.")).toBeVisible();
    }

    // The 6th attempt — even with a still-wrong password — should be
    // blocked by the rate limiter before it ever reaches Supabase Auth,
    // producing a distinct "too many attempts" message instead of the
    // generic wrong-credentials one.
    await page.fill("#email", RATE_LIMIT_TEST_EMAIL);
    await page.fill("#password", "wrong-password-6");
    await page.getByRole("button", { name: "Ingresar" }).click();

    await expect(page.getByText(/Demasiados intentos fallidos/)).toBeVisible();
  });
});
