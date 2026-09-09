/**
 * Fixed, well-known test fixtures shared between global-setup (creates
 * them), global-teardown (removes them), and every spec (logs in with
 * them). No cross-process handoff file needed — every value here is a
 * constant, not something generated at setup time.
 */
export const TEST_TENANT_SLUG = "e2e-test-tienda";
export const TEST_TENANT_NAME = "E2E Test Tienda";
export const TEST_CATEGORY_SLUG = "herramientas";
export const TEST_CATEGORY_NAME = "Herramientas";

export const TEST_OWNER_EMAIL = "e2e-owner@ds-catalog-test.example";
export const TEST_OWNER_PASSWORD = "E2e-test-password-1!";

export const TEST_SUPERADMIN_EMAIL = "e2e-superadmin@ds-catalog-test.example";
export const TEST_SUPERADMIN_PASSWORD = "E2e-test-password-2!";
