import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  // tsconfig.json sets "jsx": "preserve" for Next's own SWC compiler; Vite's
  // esbuild otherwise inherits that and emits raw JSX needing a manual React
  // import, so force the automatic runtime here instead.
  esbuild: {
    jsx: "automatic",
    jsxImportSource: "react",
  },
  resolve: {
    alias: {
      // Next.js aliases "server-only" to a no-op for server bundles at
      // build time; outside that build it always throws (see
      // node_modules/server-only/index.js), so tests need the same swap.
      "server-only": fileURLToPath(new URL("./test/server-only-stub.ts", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["**/*.test.ts"],
    exclude: ["node_modules", ".next"],
  },
});
