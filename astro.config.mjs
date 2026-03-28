// @ts-check
import svelte from "@astrojs/svelte";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  site: process.env.SITE_URL || "https://recca0120.github.io",
  base: process.env.BASE_PATH || "/codeatlas",
  output: "static",
  i18n: {
    defaultLocale: "en",
    locales: ["en", "zh-TW"],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  integrations: [svelte()],
  vite: {
    plugins: [tailwindcss()],
  },
});
