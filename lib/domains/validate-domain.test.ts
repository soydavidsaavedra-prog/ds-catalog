import { describe, expect, it } from "vitest";
import { isPlatformHost, normalizeDomain, validateDomain } from "./validate-domain";

const PLATFORM_HOST = "ds-catalog.vercel.app";

describe("normalizeDomain", () => {
  it("lowercases and trims", () => {
    expect(normalizeDomain("  TiendaEjemplo.COM  ")).toBe("tiendaejemplo.com");
  });

  it("strips protocol, path, query and hash", () => {
    expect(normalizeDomain("https://tienda.com/catalogo?ref=x#top")).toBe("tienda.com");
  });

  it("strips credentials and port", () => {
    expect(normalizeDomain("http://user:pass@tienda.com:8080/")).toBe("tienda.com");
  });

  it("strips a trailing dot", () => {
    expect(normalizeDomain("tienda.com.")).toBe("tienda.com");
  });
});

describe("validateDomain", () => {
  it("accepts a normal apex domain", () => {
    expect(validateDomain("tienda.com", PLATFORM_HOST)).toEqual({ domain: "tienda.com", error: null });
  });

  it("accepts a subdomain", () => {
    expect(validateDomain("catalogo.tienda.com", PLATFORM_HOST)).toEqual({
      domain: "catalogo.tienda.com",
      error: null,
    });
  });

  it("normalizes before validating (protocol + trailing slash)", () => {
    expect(validateDomain("https://tienda.com/", PLATFORM_HOST)).toEqual({ domain: "tienda.com", error: null });
  });

  it("rejects an empty value", () => {
    expect(validateDomain("   ", PLATFORM_HOST).error).toBeTruthy();
  });

  it("rejects localhost", () => {
    expect(validateDomain("localhost", PLATFORM_HOST).error).toBeTruthy();
  });

  it("rejects an IPv4 address", () => {
    expect(validateDomain("192.168.1.1", PLATFORM_HOST).error).toBeTruthy();
  });

  it("rejects a malformed hostname", () => {
    expect(validateDomain("not a domain", PLATFORM_HOST).error).toBeTruthy();
    expect(validateDomain("tienda", PLATFORM_HOST).error).toBeTruthy();
  });

  it("rejects the platform's own domain", () => {
    expect(validateDomain(PLATFORM_HOST, PLATFORM_HOST).error).toBeTruthy();
    expect(validateDomain(`https://${PLATFORM_HOST}`, PLATFORM_HOST).error).toBeTruthy();
  });

  it("rejects any *.vercel.app preview host", () => {
    expect(validateDomain("other-project.vercel.app", PLATFORM_HOST).error).toBeTruthy();
  });
});

describe("isPlatformHost", () => {
  it("recognizes the configured platform host", () => {
    expect(isPlatformHost(PLATFORM_HOST, PLATFORM_HOST)).toBe(true);
    expect(isPlatformHost(PLATFORM_HOST.toUpperCase(), PLATFORM_HOST)).toBe(true);
  });

  it("recognizes localhost and any *.vercel.app host", () => {
    expect(isPlatformHost("localhost", PLATFORM_HOST)).toBe(true);
    expect(isPlatformHost("preview-branch.vercel.app", PLATFORM_HOST)).toBe(true);
  });

  it("does not recognize a tenant's own custom domain", () => {
    expect(isPlatformHost("tienda.com", PLATFORM_HOST)).toBe(false);
  });
});
