// vite.config.ts
import { defineConfig } from "file:///C:/Users/Administrator/Test123/Sehat-Kor123/client/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/Administrator/Test123/Sehat-Kor123/client/node_modules/@vitejs/plugin-react-swc/index.js";
import legacy from "file:///C:/Users/Administrator/Test123/Sehat-Kor123/client/node_modules/@vitejs/plugin-legacy/dist/index.mjs";
import path from "path";
import { componentTagger } from "file:///C:/Users/Administrator/Test123/Sehat-Kor123/client/node_modules/lovable-tagger/dist/index.js";
var __vite_injected_original_dirname = "C:\\Users\\Administrator\\Test123\\Sehat-Kor123\\client";
var vite_config_default = defineConfig(({ mode }) => ({
  server: {
    host: "0.0.0.0",
    port: 8080,
    hmr: {
      host: "localhost",
      protocol: "ws",
      port: 8080
    },
    proxy: {
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true,
        secure: false
      }
    }
  },
  plugins: [
    react(),
    legacy({
      // Target a broad set of browsers including older Safari/Firefox/Edge
      targets: [
        "defaults",
        "not dead",
        "iOS >= 12",
        "Safari >= 12",
        "Firefox >= 68",
        "Edge >= 79"
      ],
      additionalLegacyPolyfills: ["regenerator-runtime/runtime"],
      renderLegacyChunks: true,
      modernPolyfills: true
    }),
    mode === "development" && componentTagger()
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  },
  esbuild: {
    target: "es2017"
  },
  build: {
    // Transpile down to broadly supported syntax
    target: "es2017",
    cssTarget: ["chrome61", "safari11", "firefox60"]
  }
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxBZG1pbmlzdHJhdG9yXFxcXFRlc3QxMjNcXFxcU2VoYXQtS29yMTIzXFxcXGNsaWVudFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcQWRtaW5pc3RyYXRvclxcXFxUZXN0MTIzXFxcXFNlaGF0LUtvcjEyM1xcXFxjbGllbnRcXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL0FkbWluaXN0cmF0b3IvVGVzdDEyMy9TZWhhdC1Lb3IxMjMvY2xpZW50L3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcclxuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdC1zd2NcIjtcclxuaW1wb3J0IGxlZ2FjeSBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tbGVnYWN5XCI7XHJcbmltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCI7XHJcbmltcG9ydCB7IGNvbXBvbmVudFRhZ2dlciB9IGZyb20gXCJsb3ZhYmxlLXRhZ2dlclwiO1xyXG5cclxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCh7IG1vZGUgfSkgPT4gKHtcclxuICBzZXJ2ZXI6IHtcclxuICAgIGhvc3Q6IFwiMC4wLjAuMFwiLFxyXG4gICAgcG9ydDogODA4MCxcclxuICAgIGhtcjoge1xyXG4gICAgICBob3N0OiBcImxvY2FsaG9zdFwiLFxyXG4gICAgICBwcm90b2NvbDogXCJ3c1wiLFxyXG4gICAgICBwb3J0OiA4MDgwLFxyXG4gICAgfSxcclxuICAgIHByb3h5OiB7XHJcbiAgICAgICcvYXBpJzoge1xyXG4gICAgICAgIHRhcmdldDogJ2h0dHA6Ly9sb2NhbGhvc3Q6NDAwMCcsXHJcbiAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxyXG4gICAgICAgIHNlY3VyZTogZmFsc2UsXHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIH0sXHJcbiAgcGx1Z2luczogW1xyXG4gICAgcmVhY3QoKSxcclxuICAgIGxlZ2FjeSh7XHJcbiAgICAgIC8vIFRhcmdldCBhIGJyb2FkIHNldCBvZiBicm93c2VycyBpbmNsdWRpbmcgb2xkZXIgU2FmYXJpL0ZpcmVmb3gvRWRnZVxyXG4gICAgICB0YXJnZXRzOiBbXHJcbiAgICAgICAgXCJkZWZhdWx0c1wiLFxyXG4gICAgICAgIFwibm90IGRlYWRcIixcclxuICAgICAgICBcImlPUyA+PSAxMlwiLFxyXG4gICAgICAgIFwiU2FmYXJpID49IDEyXCIsXHJcbiAgICAgICAgXCJGaXJlZm94ID49IDY4XCIsXHJcbiAgICAgICAgXCJFZGdlID49IDc5XCIsXHJcbiAgICAgIF0sXHJcbiAgICAgIGFkZGl0aW9uYWxMZWdhY3lQb2x5ZmlsbHM6IFtcInJlZ2VuZXJhdG9yLXJ1bnRpbWUvcnVudGltZVwiXSxcclxuICAgICAgcmVuZGVyTGVnYWN5Q2h1bmtzOiB0cnVlLFxyXG4gICAgICBtb2Rlcm5Qb2x5ZmlsbHM6IHRydWUsXHJcbiAgICB9KSxcclxuICAgIG1vZGUgPT09ICdkZXZlbG9wbWVudCcgJiZcclxuICAgIGNvbXBvbmVudFRhZ2dlcigpLFxyXG4gIF0uZmlsdGVyKEJvb2xlYW4pLFxyXG4gIHJlc29sdmU6IHtcclxuICAgIGFsaWFzOiB7XHJcbiAgICAgIFwiQFwiOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIi4vc3JjXCIpLFxyXG4gICAgfSxcclxuICB9LFxyXG4gIGVzYnVpbGQ6IHtcclxuICAgIHRhcmdldDogXCJlczIwMTdcIixcclxuICB9LFxyXG4gIGJ1aWxkOiB7XHJcbiAgICAvLyBUcmFuc3BpbGUgZG93biB0byBicm9hZGx5IHN1cHBvcnRlZCBzeW50YXhcclxuICAgIHRhcmdldDogXCJlczIwMTdcIixcclxuICAgIGNzc1RhcmdldDogW1wiY2hyb21lNjFcIiwgXCJzYWZhcmkxMVwiLCBcImZpcmVmb3g2MFwiXSxcclxuICB9LFxyXG59KSk7XHJcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBb1YsU0FBUyxvQkFBb0I7QUFDalgsT0FBTyxXQUFXO0FBQ2xCLE9BQU8sWUFBWTtBQUNuQixPQUFPLFVBQVU7QUFDakIsU0FBUyx1QkFBdUI7QUFKaEMsSUFBTSxtQ0FBbUM7QUFPekMsSUFBTyxzQkFBUSxhQUFhLENBQUMsRUFBRSxLQUFLLE9BQU87QUFBQSxFQUN6QyxRQUFRO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixLQUFLO0FBQUEsTUFDSCxNQUFNO0FBQUEsTUFDTixVQUFVO0FBQUEsTUFDVixNQUFNO0FBQUEsSUFDUjtBQUFBLElBQ0EsT0FBTztBQUFBLE1BQ0wsUUFBUTtBQUFBLFFBQ04sUUFBUTtBQUFBLFFBQ1IsY0FBYztBQUFBLFFBQ2QsUUFBUTtBQUFBLE1BQ1Y7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1AsTUFBTTtBQUFBLElBQ04sT0FBTztBQUFBO0FBQUEsTUFFTCxTQUFTO0FBQUEsUUFDUDtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsTUFDRjtBQUFBLE1BQ0EsMkJBQTJCLENBQUMsNkJBQTZCO0FBQUEsTUFDekQsb0JBQW9CO0FBQUEsTUFDcEIsaUJBQWlCO0FBQUEsSUFDbkIsQ0FBQztBQUFBLElBQ0QsU0FBUyxpQkFDVCxnQkFBZ0I7QUFBQSxFQUNsQixFQUFFLE9BQU8sT0FBTztBQUFBLEVBQ2hCLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLEtBQUssS0FBSyxRQUFRLGtDQUFXLE9BQU87QUFBQSxJQUN0QztBQUFBLEVBQ0Y7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLFFBQVE7QUFBQSxFQUNWO0FBQUEsRUFDQSxPQUFPO0FBQUE7QUFBQSxJQUVMLFFBQVE7QUFBQSxJQUNSLFdBQVcsQ0FBQyxZQUFZLFlBQVksV0FBVztBQUFBLEVBQ2pEO0FBQ0YsRUFBRTsiLAogICJuYW1lcyI6IFtdCn0K
