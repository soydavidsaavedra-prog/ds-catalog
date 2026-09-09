import path from "node:path";
import { expect, test } from "@playwright/test";
import { TEST_OWNER_EMAIL, TEST_OWNER_PASSWORD, TEST_TENANT_SLUG } from "./setup/constants";

const FIXTURE_PATH = path.join(__dirname, "fixtures", "products.csv");

test.describe("CSV product import", () => {
  test("imports every valid row from the fixture and lists the products afterward", async ({ page }) => {
    await page.goto("/acceder");
    await page.fill("#email", TEST_OWNER_EMAIL);
    await page.fill("#password", TEST_OWNER_PASSWORD);
    await page.getByRole("button", { name: "Ingresar" }).click();
    await expect(page).toHaveURL(new RegExp(`/${TEST_TENANT_SLUG}/admin`));

    await page.goto(`/${TEST_TENANT_SLUG}/admin/productos/importar`);
    await page.setInputFiles("#file", FIXTURE_PATH);
    await page.getByRole("button", { name: "Importar" }).click();

    // fixtures/products.csv has exactly 2 valid rows, both against the
    // "herramientas" category seeded in global-setup.ts.
    await expect(page.getByText("2 productos importados.")).toBeVisible();

    await page.getByRole("link", { name: "Ver productos" }).click();
    await expect(page.getByText("Taladro de prueba")).toBeVisible();
    await expect(page.getByText("Martillo de prueba")).toBeVisible();
  });
});
