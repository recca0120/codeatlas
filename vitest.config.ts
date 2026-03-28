import { svelte } from "@sveltejs/vite-plugin-svelte";
import { svelteTesting } from "@testing-library/svelte/vite";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [svelte({ hot: false }), svelteTesting()],
  test: {
    globals: true,
    restoreMocks: true,
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["node_modules", "dist", "e2e"],
    environment: "node",
    setupFiles: ["./vitest-setup.ts"],
    coverage: {
      provider: "v8",
      include: ["src/**/*.ts", "src/**/*.svelte"],
      exclude: ["src/**/*.d.ts", "src/**/*.test.ts", "src/**/*.spec.ts"],
    },
  },
});
