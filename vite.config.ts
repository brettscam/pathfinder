import { defineConfig } from "vite";
import webExtension from "vite-plugin-web-extension";
import { resolve } from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@shared": resolve(__dirname, "src/shared"),
    },
  },
  plugins: [
    webExtension({
      manifest: "manifest.json",
      additionalInputs: ["src/content/index.tsx"],
    }),
  ],
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
