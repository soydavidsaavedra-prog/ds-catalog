import { describe, expect, it } from "vitest";
import { buildNewTenantRegistrationEmail, escapeHtml } from "./tenant-notifications";

describe("escapeHtml", () => {
  it("escapes the characters that matter for HTML injection", () => {
    expect(escapeHtml(`<script>alert('hi')</script> & "quotes"`)).toBe(
      "&lt;script&gt;alert(&#39;hi&#39;)&lt;/script&gt; &amp; &quot;quotes&quot;",
    );
  });

  it("leaves plain text untouched", () => {
    expect(escapeHtml("Ferretería El Tornillo")).toBe("Ferretería El Tornillo");
  });
});

describe("buildNewTenantRegistrationEmail", () => {
  const input = {
    tenantId: "tenant-1",
    tenantName: "Ferretería El Tornillo",
    tenantSlug: "ferreteria-el-tornillo",
    ownerEmail: "dueño@ejemplo.com",
    planName: "Pro",
  };

  it("includes the tenant name, slug, owner email and plan in the subject/body", () => {
    const { subject, html } = buildNewTenantRegistrationEmail(input);
    expect(subject).toContain("Ferretería El Tornillo");
    expect(html).toContain("Ferretería El Tornillo");
    expect(html).toContain("ferreteria-el-tornillo");
    expect(html).toContain("dueño@ejemplo.com");
    expect(html).toContain("Pro");
  });

  it("links to that tenant's Super Admin review page", () => {
    const { html } = buildNewTenantRegistrationEmail(input);
    expect(html).toContain("/superadmin/tenants/tenant-1");
  });

  it("escapes a maliciously-named tenant instead of injecting raw HTML", () => {
    const { html } = buildNewTenantRegistrationEmail({
      ...input,
      tenantName: `<img src=x onerror=alert(1)>`,
    });
    expect(html).not.toContain("<img");
    expect(html).toContain("&lt;img");
  });
});
