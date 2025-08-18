// vite.config.ts
import { defineConfig } from "file:///C:/Users/Administrator/Sehat%20Kor/FullStack-SehatKor-Website-ash-cloud/client/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/Administrator/Sehat%20Kor/FullStack-SehatKor-Website-ash-cloud/client/node_modules/@vitejs/plugin-react-swc/index.js";
import legacy from "file:///C:/Users/Administrator/Sehat%20Kor/FullStack-SehatKor-Website-ash-cloud/client/node_modules/@vitejs/plugin-legacy/dist/index.mjs";
import path from "path";
import { componentTagger } from "file:///C:/Users/Administrator/Sehat%20Kor/FullStack-SehatKor-Website-ash-cloud/client/node_modules/lovable-tagger/dist/index.js";
var __vite_injected_original_dirname = "C:\\Users\\Administrator\\Sehat Kor\\FullStack-SehatKor-Website-ash-cloud\\client";
var vite_config_default = defineConfig(({ mode }) => ({
  server: {
    host: "0.0.0.0",
    port: 8080,
    hmr: {
      host: "localhost",
      protocol: "ws",
      port: 8080
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxBZG1pbmlzdHJhdG9yXFxcXFNlaGF0IEtvclxcXFxGdWxsU3RhY2stU2VoYXRLb3ItV2Vic2l0ZS1hc2gtY2xvdWRcXFxcY2xpZW50XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxBZG1pbmlzdHJhdG9yXFxcXFNlaGF0IEtvclxcXFxGdWxsU3RhY2stU2VoYXRLb3ItV2Vic2l0ZS1hc2gtY2xvdWRcXFxcY2xpZW50XFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9BZG1pbmlzdHJhdG9yL1NlaGF0JTIwS29yL0Z1bGxTdGFjay1TZWhhdEtvci1XZWJzaXRlLWFzaC1jbG91ZC9jbGllbnQvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xyXG5pbXBvcnQgcmVhY3QgZnJvbSBcIkB2aXRlanMvcGx1Z2luLXJlYWN0LXN3Y1wiO1xyXG5pbXBvcnQgbGVnYWN5IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1sZWdhY3lcIjtcclxuaW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIjtcclxuaW1wb3J0IHsgY29tcG9uZW50VGFnZ2VyIH0gZnJvbSBcImxvdmFibGUtdGFnZ2VyXCI7XHJcblxyXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgbW9kZSB9KSA9PiAoe1xyXG4gIHNlcnZlcjoge1xyXG4gICAgaG9zdDogXCIwLjAuMC4wXCIsXHJcbiAgICBwb3J0OiA4MDgwLFxyXG4gICAgaG1yOiB7XHJcbiAgICAgIGhvc3Q6IFwibG9jYWxob3N0XCIsXHJcbiAgICAgIHByb3RvY29sOiBcIndzXCIsXHJcbiAgICAgIHBvcnQ6IDgwODAsXHJcbiAgICB9LFxyXG4gIH0sXHJcbiAgcGx1Z2luczogW1xyXG4gICAgcmVhY3QoKSxcclxuICAgIGxlZ2FjeSh7XHJcbiAgICAgIC8vIFRhcmdldCBhIGJyb2FkIHNldCBvZiBicm93c2VycyBpbmNsdWRpbmcgb2xkZXIgU2FmYXJpL0ZpcmVmb3gvRWRnZVxyXG4gICAgICB0YXJnZXRzOiBbXHJcbiAgICAgICAgXCJkZWZhdWx0c1wiLFxyXG4gICAgICAgIFwibm90IGRlYWRcIixcclxuICAgICAgICBcImlPUyA+PSAxMlwiLFxyXG4gICAgICAgIFwiU2FmYXJpID49IDEyXCIsXHJcbiAgICAgICAgXCJGaXJlZm94ID49IDY4XCIsXHJcbiAgICAgICAgXCJFZGdlID49IDc5XCIsXHJcbiAgICAgIF0sXHJcbiAgICAgIGFkZGl0aW9uYWxMZWdhY3lQb2x5ZmlsbHM6IFtcInJlZ2VuZXJhdG9yLXJ1bnRpbWUvcnVudGltZVwiXSxcclxuICAgICAgcmVuZGVyTGVnYWN5Q2h1bmtzOiB0cnVlLFxyXG4gICAgICBtb2Rlcm5Qb2x5ZmlsbHM6IHRydWUsXHJcbiAgICB9KSxcclxuICAgIG1vZGUgPT09ICdkZXZlbG9wbWVudCcgJiZcclxuICAgIGNvbXBvbmVudFRhZ2dlcigpLFxyXG4gIF0uZmlsdGVyKEJvb2xlYW4pLFxyXG4gIHJlc29sdmU6IHtcclxuICAgIGFsaWFzOiB7XHJcbiAgICAgIFwiQFwiOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIi4vc3JjXCIpLFxyXG4gICAgfSxcclxuICB9LFxyXG4gIGVzYnVpbGQ6IHtcclxuICAgIHRhcmdldDogXCJlczIwMTdcIixcclxuICB9LFxyXG4gIGJ1aWxkOiB7XHJcbiAgICAvLyBUcmFuc3BpbGUgZG93biB0byBicm9hZGx5IHN1cHBvcnRlZCBzeW50YXhcclxuICAgIHRhcmdldDogXCJlczIwMTdcIixcclxuICAgIGNzc1RhcmdldDogW1wiY2hyb21lNjFcIiwgXCJzYWZhcmkxMVwiLCBcImZpcmVmb3g2MFwiXSxcclxuICB9LFxyXG59KSk7XHJcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBb2EsU0FBUyxvQkFBb0I7QUFDamMsT0FBTyxXQUFXO0FBQ2xCLE9BQU8sWUFBWTtBQUNuQixPQUFPLFVBQVU7QUFDakIsU0FBUyx1QkFBdUI7QUFKaEMsSUFBTSxtQ0FBbUM7QUFPekMsSUFBTyxzQkFBUSxhQUFhLENBQUMsRUFBRSxLQUFLLE9BQU87QUFBQSxFQUN6QyxRQUFRO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixLQUFLO0FBQUEsTUFDSCxNQUFNO0FBQUEsTUFDTixVQUFVO0FBQUEsTUFDVixNQUFNO0FBQUEsSUFDUjtBQUFBLEVBQ0Y7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLE1BQU07QUFBQSxJQUNOLE9BQU87QUFBQTtBQUFBLE1BRUwsU0FBUztBQUFBLFFBQ1A7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLE1BQ0Y7QUFBQSxNQUNBLDJCQUEyQixDQUFDLDZCQUE2QjtBQUFBLE1BQ3pELG9CQUFvQjtBQUFBLE1BQ3BCLGlCQUFpQjtBQUFBLElBQ25CLENBQUM7QUFBQSxJQUNELFNBQVMsaUJBQ1QsZ0JBQWdCO0FBQUEsRUFDbEIsRUFBRSxPQUFPLE9BQU87QUFBQSxFQUNoQixTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsTUFDTCxLQUFLLEtBQUssUUFBUSxrQ0FBVyxPQUFPO0FBQUEsSUFDdEM7QUFBQSxFQUNGO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUCxRQUFRO0FBQUEsRUFDVjtBQUFBLEVBQ0EsT0FBTztBQUFBO0FBQUEsSUFFTCxRQUFRO0FBQUEsSUFDUixXQUFXLENBQUMsWUFBWSxZQUFZLFdBQVc7QUFBQSxFQUNqRDtBQUNGLEVBQUU7IiwKICAibmFtZXMiOiBbXQp9Cg==
