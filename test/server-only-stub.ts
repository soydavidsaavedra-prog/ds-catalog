// Stub for the "server-only" package under Vitest: outside Next.js's own
// webpack build, that package unconditionally throws (it relies on Next.js
// aliasing it to a no-op only for server bundles) — see vitest.config.ts's
// resolve.alias, which points every "server-only" import here instead.
export {};
