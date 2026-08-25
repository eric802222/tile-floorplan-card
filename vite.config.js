import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  build: {
    lib: {
      entry: resolve(import.meta.dirname, "src/index.js"),
      formats: ["es"],
      fileName: () => "tile-floorplan-card.js",
    },
    outDir: ".",
    emptyOutDir: false,
    minify: "esbuild",
    rollupOptions: {
      output: { inlineDynamicImports: true },
    },
  },
});
