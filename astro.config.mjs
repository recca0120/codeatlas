// @ts-check
import svelte from "@astrojs/svelte";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  site: "https://recca0120.github.io",
  base: "/codeatlas",
  output: "static",
  integrations: [svelte()],
  vite: {
    plugins: [tailwindcss()],
  },
});
