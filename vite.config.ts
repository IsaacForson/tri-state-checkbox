import vue from "@vitejs/plugin-vue";
import * as path from "path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";

export default defineConfig({
  plugins: [vue(), dts(), cssInjectedByJsPlugin()],
  build: {
    lib: {
      //@ts-ignore
      entry: path.resolve(__dirname, "src/index.ts"),
      name: "HeatmapCalendar",
      fileName: "heatmap-calendar-component"
    },
    rollupOptions: {
      external: ["vue"],
      output: {
        globals: {
          vue: "Vue"
        }
      }
    }
  },
  resolve: {
    alias: {
      //@ts-ignore
      "@": path.resolve(__dirname, "src")
    }
  }
});
