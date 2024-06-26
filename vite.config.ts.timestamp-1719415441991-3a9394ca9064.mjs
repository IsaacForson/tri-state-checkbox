// vite.config.ts
import vue from "file:///Users/isaacforson/Desktop/PROJECTS/heatmap-calendar-component/node_modules/.pnpm/@vitejs+plugin-vue@4.6.2_vite@4.5.3_sass@1.77.3__vue@3.4.27_typescript@5.4.5_/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import * as path from "path";
import { defineConfig } from "file:///Users/isaacforson/Desktop/PROJECTS/heatmap-calendar-component/node_modules/.pnpm/vite@4.5.3_sass@1.77.3/node_modules/vite/dist/node/index.js";
import dts from "file:///Users/isaacforson/Desktop/PROJECTS/heatmap-calendar-component/node_modules/.pnpm/vite-plugin-dts@2.3.0_rollup@3.29.4_vite@4.5.3_sass@1.77.3_/node_modules/vite-plugin-dts/dist/index.mjs";
import cssInjectedByJsPlugin from "file:///Users/isaacforson/Desktop/PROJECTS/heatmap-calendar-component/node_modules/.pnpm/vite-plugin-css-injected-by-js@3.5.1_vite@4.5.3_sass@1.77.3_/node_modules/vite-plugin-css-injected-by-js/dist/esm/index.js";
var __vite_injected_original_dirname = "/Users/isaacforson/Desktop/PROJECTS/heatmap-calendar-component";
var vite_config_default = defineConfig({
  plugins: [vue(), dts(), cssInjectedByJsPlugin()],
  build: {
    lib: {
      //@ts-ignore
      entry: path.resolve(__vite_injected_original_dirname, "src/index.ts"),
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
      "@": path.resolve(__vite_injected_original_dirname, "src")
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvaXNhYWNmb3Jzb24vRGVza3RvcC9QUk9KRUNUUy9oZWF0bWFwLWNhbGVuZGFyLWNvbXBvbmVudFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL2lzYWFjZm9yc29uL0Rlc2t0b3AvUFJPSkVDVFMvaGVhdG1hcC1jYWxlbmRhci1jb21wb25lbnQvdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL2lzYWFjZm9yc29uL0Rlc2t0b3AvUFJPSkVDVFMvaGVhdG1hcC1jYWxlbmRhci1jb21wb25lbnQvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgdnVlIGZyb20gXCJAdml0ZWpzL3BsdWdpbi12dWVcIjtcbmltcG9ydCAqIGFzIHBhdGggZnJvbSBcInBhdGhcIjtcbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gXCJ2aXRlXCI7XG5pbXBvcnQgZHRzIGZyb20gXCJ2aXRlLXBsdWdpbi1kdHNcIjtcbmltcG9ydCBjc3NJbmplY3RlZEJ5SnNQbHVnaW4gZnJvbSBcInZpdGUtcGx1Z2luLWNzcy1pbmplY3RlZC1ieS1qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBwbHVnaW5zOiBbdnVlKCksIGR0cygpLCBjc3NJbmplY3RlZEJ5SnNQbHVnaW4oKV0sXG4gIGJ1aWxkOiB7XG4gICAgbGliOiB7XG4gICAgICAvL0B0cy1pZ25vcmVcbiAgICAgIGVudHJ5OiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcInNyYy9pbmRleC50c1wiKSxcbiAgICAgIG5hbWU6IFwiSGVhdG1hcENhbGVuZGFyXCIsXG4gICAgICBmaWxlTmFtZTogXCJoZWF0bWFwLWNhbGVuZGFyLWNvbXBvbmVudFwiXG4gICAgfSxcbiAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICBleHRlcm5hbDogW1widnVlXCJdLFxuICAgICAgb3V0cHV0OiB7XG4gICAgICAgIGdsb2JhbHM6IHtcbiAgICAgICAgICB2dWU6IFwiVnVlXCJcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfSxcbiAgcmVzb2x2ZToge1xuICAgIGFsaWFzOiB7XG4gICAgICAvL0B0cy1pZ25vcmVcbiAgICAgIFwiQFwiOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcInNyY1wiKVxuICAgIH1cbiAgfVxufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQTRXLE9BQU8sU0FBUztBQUM1WCxZQUFZLFVBQVU7QUFDdEIsU0FBUyxvQkFBb0I7QUFDN0IsT0FBTyxTQUFTO0FBQ2hCLE9BQU8sMkJBQTJCO0FBSmxDLElBQU0sbUNBQW1DO0FBTXpDLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVMsQ0FBQyxJQUFJLEdBQUcsSUFBSSxHQUFHLHNCQUFzQixDQUFDO0FBQUEsRUFDL0MsT0FBTztBQUFBLElBQ0wsS0FBSztBQUFBO0FBQUEsTUFFSCxPQUFZLGFBQVEsa0NBQVcsY0FBYztBQUFBLE1BQzdDLE1BQU07QUFBQSxNQUNOLFVBQVU7QUFBQSxJQUNaO0FBQUEsSUFDQSxlQUFlO0FBQUEsTUFDYixVQUFVLENBQUMsS0FBSztBQUFBLE1BQ2hCLFFBQVE7QUFBQSxRQUNOLFNBQVM7QUFBQSxVQUNQLEtBQUs7QUFBQSxRQUNQO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUE7QUFBQSxNQUVMLEtBQVUsYUFBUSxrQ0FBVyxLQUFLO0FBQUEsSUFDcEM7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
