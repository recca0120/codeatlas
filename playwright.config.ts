import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  webServer: {
    command:
      "BASE_PATH=/ SITE_URL=http://localhost:4173 pnpm build && BASE_PATH=/ SITE_URL=http://localhost:4173 pnpm preview --port 4173",
    port: 4173,
    reuseExistingServer: false,
  },
  use: {
    baseURL: "http://localhost:4173",
  },
});
