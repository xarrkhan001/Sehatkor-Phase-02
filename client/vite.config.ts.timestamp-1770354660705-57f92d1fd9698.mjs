// vite.config.ts
import { defineConfig } from "file:///E:/Sehatkor%20SEO/Sehatkor-Phase-02/client/node_modules/vite/dist/node/index.js";
import react from "file:///E:/Sehatkor%20SEO/Sehatkor-Phase-02/client/node_modules/@vitejs/plugin-react-swc/index.js";
import legacy from "file:///E:/Sehatkor%20SEO/Sehatkor-Phase-02/client/node_modules/@vitejs/plugin-legacy/dist/index.mjs";
import path from "path";
import { componentTagger } from "file:///E:/Sehatkor%20SEO/Sehatkor-Phase-02/client/node_modules/lovable-tagger/dist/index.js";
var __vite_injected_original_dirname = "E:\\Sehatkor SEO\\Sehatkor-Phase-02\\client";
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
    cssTarget: ["chrome61", "safari11", "firefox60"],
    // Performance optimizations for better Core Web Vitals
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate vendor chunks for better caching
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          "ui-vendor": [
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-select",
            "@radix-ui/react-tabs",
            "@radix-ui/react-toast"
          ],
          "animation-vendor": ["framer-motion"],
          "icons-vendor": ["lucide-react", "react-icons"],
          "maps-vendor": ["@react-google-maps/api", "leaflet", "react-leaflet"],
          "query-vendor": ["@tanstack/react-query", "axios"]
        }
      }
    },
    chunkSizeWarningLimit: 1e3,
    // Minification for production
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ["console.log", "console.info"]
      }
    }
  }
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJFOlxcXFxTZWhhdGtvciBTRU9cXFxcU2VoYXRrb3ItUGhhc2UtMDJcXFxcY2xpZW50XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJFOlxcXFxTZWhhdGtvciBTRU9cXFxcU2VoYXRrb3ItUGhhc2UtMDJcXFxcY2xpZW50XFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9FOi9TZWhhdGtvciUyMFNFTy9TZWhhdGtvci1QaGFzZS0wMi9jbGllbnQvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xyXG5pbXBvcnQgcmVhY3QgZnJvbSBcIkB2aXRlanMvcGx1Z2luLXJlYWN0LXN3Y1wiO1xyXG5pbXBvcnQgbGVnYWN5IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1sZWdhY3lcIjtcclxuaW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIjtcclxuaW1wb3J0IHsgY29tcG9uZW50VGFnZ2VyIH0gZnJvbSBcImxvdmFibGUtdGFnZ2VyXCI7XHJcblxyXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgbW9kZSB9KSA9PiAoe1xyXG4gIHNlcnZlcjoge1xyXG4gICAgaG9zdDogXCIwLjAuMC4wXCIsXHJcbiAgICBwb3J0OiA4MDgwLFxyXG4gICAgaG1yOiB7XHJcbiAgICAgIGhvc3Q6IFwibG9jYWxob3N0XCIsXHJcbiAgICAgIHByb3RvY29sOiBcIndzXCIsXHJcbiAgICAgIHBvcnQ6IDgwODAsXHJcbiAgICB9LFxyXG4gICAgcHJveHk6IHtcclxuICAgICAgJy9hcGknOiB7XHJcbiAgICAgICAgdGFyZ2V0OiAnaHR0cDovL2xvY2FsaG9zdDo0MDAwJyxcclxuICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXHJcbiAgICAgICAgc2VjdXJlOiBmYWxzZSxcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgfSxcclxuICBwbHVnaW5zOiBbXHJcbiAgICByZWFjdCgpLFxyXG4gICAgbGVnYWN5KHtcclxuICAgICAgLy8gVGFyZ2V0IGEgYnJvYWQgc2V0IG9mIGJyb3dzZXJzIGluY2x1ZGluZyBvbGRlciBTYWZhcmkvRmlyZWZveC9FZGdlXHJcbiAgICAgIHRhcmdldHM6IFtcclxuICAgICAgICBcImRlZmF1bHRzXCIsXHJcbiAgICAgICAgXCJub3QgZGVhZFwiLFxyXG4gICAgICAgIFwiaU9TID49IDEyXCIsXHJcbiAgICAgICAgXCJTYWZhcmkgPj0gMTJcIixcclxuICAgICAgICBcIkZpcmVmb3ggPj0gNjhcIixcclxuICAgICAgICBcIkVkZ2UgPj0gNzlcIixcclxuICAgICAgXSxcclxuICAgICAgYWRkaXRpb25hbExlZ2FjeVBvbHlmaWxsczogW1wicmVnZW5lcmF0b3ItcnVudGltZS9ydW50aW1lXCJdLFxyXG4gICAgICByZW5kZXJMZWdhY3lDaHVua3M6IHRydWUsXHJcbiAgICAgIG1vZGVyblBvbHlmaWxsczogdHJ1ZSxcclxuICAgIH0pLFxyXG4gICAgbW9kZSA9PT0gJ2RldmVsb3BtZW50JyAmJlxyXG4gICAgY29tcG9uZW50VGFnZ2VyKCksXHJcbiAgXS5maWx0ZXIoQm9vbGVhbiksXHJcbiAgcmVzb2x2ZToge1xyXG4gICAgYWxpYXM6IHtcclxuICAgICAgXCJAXCI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi9zcmNcIiksXHJcbiAgICB9LFxyXG4gIH0sXHJcbiAgZXNidWlsZDoge1xyXG4gICAgdGFyZ2V0OiBcImVzMjAxN1wiLFxyXG4gIH0sXHJcbiAgYnVpbGQ6IHtcclxuICAgIC8vIFRyYW5zcGlsZSBkb3duIHRvIGJyb2FkbHkgc3VwcG9ydGVkIHN5bnRheFxyXG4gICAgdGFyZ2V0OiBcImVzMjAxN1wiLFxyXG4gICAgY3NzVGFyZ2V0OiBbXCJjaHJvbWU2MVwiLCBcInNhZmFyaTExXCIsIFwiZmlyZWZveDYwXCJdLFxyXG4gICAgLy8gUGVyZm9ybWFuY2Ugb3B0aW1pemF0aW9ucyBmb3IgYmV0dGVyIENvcmUgV2ViIFZpdGFsc1xyXG4gICAgcm9sbHVwT3B0aW9uczoge1xyXG4gICAgICBvdXRwdXQ6IHtcclxuICAgICAgICBtYW51YWxDaHVua3M6IHtcclxuICAgICAgICAgIC8vIFNlcGFyYXRlIHZlbmRvciBjaHVua3MgZm9yIGJldHRlciBjYWNoaW5nXHJcbiAgICAgICAgICAncmVhY3QtdmVuZG9yJzogWydyZWFjdCcsICdyZWFjdC1kb20nLCAncmVhY3Qtcm91dGVyLWRvbSddLFxyXG4gICAgICAgICAgJ3VpLXZlbmRvcic6IFtcclxuICAgICAgICAgICAgJ0ByYWRpeC11aS9yZWFjdC1kaWFsb2cnLFxyXG4gICAgICAgICAgICAnQHJhZGl4LXVpL3JlYWN0LWRyb3Bkb3duLW1lbnUnLFxyXG4gICAgICAgICAgICAnQHJhZGl4LXVpL3JlYWN0LXNlbGVjdCcsXHJcbiAgICAgICAgICAgICdAcmFkaXgtdWkvcmVhY3QtdGFicycsXHJcbiAgICAgICAgICAgICdAcmFkaXgtdWkvcmVhY3QtdG9hc3QnLFxyXG4gICAgICAgICAgXSxcclxuICAgICAgICAgICdhbmltYXRpb24tdmVuZG9yJzogWydmcmFtZXItbW90aW9uJ10sXHJcbiAgICAgICAgICAnaWNvbnMtdmVuZG9yJzogWydsdWNpZGUtcmVhY3QnLCAncmVhY3QtaWNvbnMnXSxcclxuICAgICAgICAgICdtYXBzLXZlbmRvcic6IFsnQHJlYWN0LWdvb2dsZS1tYXBzL2FwaScsICdsZWFmbGV0JywgJ3JlYWN0LWxlYWZsZXQnXSxcclxuICAgICAgICAgICdxdWVyeS12ZW5kb3InOiBbJ0B0YW5zdGFjay9yZWFjdC1xdWVyeScsICdheGlvcyddLFxyXG4gICAgICAgIH0sXHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAgY2h1bmtTaXplV2FybmluZ0xpbWl0OiAxMDAwLFxyXG4gICAgLy8gTWluaWZpY2F0aW9uIGZvciBwcm9kdWN0aW9uXHJcbiAgICBtaW5pZnk6ICd0ZXJzZXInLFxyXG4gICAgdGVyc2VyT3B0aW9uczoge1xyXG4gICAgICBjb21wcmVzczoge1xyXG4gICAgICAgIGRyb3BfY29uc29sZTogdHJ1ZSxcclxuICAgICAgICBkcm9wX2RlYnVnZ2VyOiB0cnVlLFxyXG4gICAgICAgIHB1cmVfZnVuY3M6IFsnY29uc29sZS5sb2cnLCAnY29uc29sZS5pbmZvJ10sXHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIH0sXHJcbn0pKTtcclxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFvVCxTQUFTLG9CQUFvQjtBQUNqVixPQUFPLFdBQVc7QUFDbEIsT0FBTyxZQUFZO0FBQ25CLE9BQU8sVUFBVTtBQUNqQixTQUFTLHVCQUF1QjtBQUpoQyxJQUFNLG1DQUFtQztBQU96QyxJQUFPLHNCQUFRLGFBQWEsQ0FBQyxFQUFFLEtBQUssT0FBTztBQUFBLEVBQ3pDLFFBQVE7QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLEtBQUs7QUFBQSxNQUNILE1BQU07QUFBQSxNQUNOLFVBQVU7QUFBQSxNQUNWLE1BQU07QUFBQSxJQUNSO0FBQUEsSUFDQSxPQUFPO0FBQUEsTUFDTCxRQUFRO0FBQUEsUUFDTixRQUFRO0FBQUEsUUFDUixjQUFjO0FBQUEsUUFDZCxRQUFRO0FBQUEsTUFDVjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUCxNQUFNO0FBQUEsSUFDTixPQUFPO0FBQUE7QUFBQSxNQUVMLFNBQVM7QUFBQSxRQUNQO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxNQUNGO0FBQUEsTUFDQSwyQkFBMkIsQ0FBQyw2QkFBNkI7QUFBQSxNQUN6RCxvQkFBb0I7QUFBQSxNQUNwQixpQkFBaUI7QUFBQSxJQUNuQixDQUFDO0FBQUEsSUFDRCxTQUFTLGlCQUNULGdCQUFnQjtBQUFBLEVBQ2xCLEVBQUUsT0FBTyxPQUFPO0FBQUEsRUFDaEIsU0FBUztBQUFBLElBQ1AsT0FBTztBQUFBLE1BQ0wsS0FBSyxLQUFLLFFBQVEsa0NBQVcsT0FBTztBQUFBLElBQ3RDO0FBQUEsRUFDRjtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1AsUUFBUTtBQUFBLEVBQ1Y7QUFBQSxFQUNBLE9BQU87QUFBQTtBQUFBLElBRUwsUUFBUTtBQUFBLElBQ1IsV0FBVyxDQUFDLFlBQVksWUFBWSxXQUFXO0FBQUE7QUFBQSxJQUUvQyxlQUFlO0FBQUEsTUFDYixRQUFRO0FBQUEsUUFDTixjQUFjO0FBQUE7QUFBQSxVQUVaLGdCQUFnQixDQUFDLFNBQVMsYUFBYSxrQkFBa0I7QUFBQSxVQUN6RCxhQUFhO0FBQUEsWUFDWDtBQUFBLFlBQ0E7QUFBQSxZQUNBO0FBQUEsWUFDQTtBQUFBLFlBQ0E7QUFBQSxVQUNGO0FBQUEsVUFDQSxvQkFBb0IsQ0FBQyxlQUFlO0FBQUEsVUFDcEMsZ0JBQWdCLENBQUMsZ0JBQWdCLGFBQWE7QUFBQSxVQUM5QyxlQUFlLENBQUMsMEJBQTBCLFdBQVcsZUFBZTtBQUFBLFVBQ3BFLGdCQUFnQixDQUFDLHlCQUF5QixPQUFPO0FBQUEsUUFDbkQ7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLElBQ0EsdUJBQXVCO0FBQUE7QUFBQSxJQUV2QixRQUFRO0FBQUEsSUFDUixlQUFlO0FBQUEsTUFDYixVQUFVO0FBQUEsUUFDUixjQUFjO0FBQUEsUUFDZCxlQUFlO0FBQUEsUUFDZixZQUFZLENBQUMsZUFBZSxjQUFjO0FBQUEsTUFDNUM7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUNGLEVBQUU7IiwKICAibmFtZXMiOiBbXQp9Cg==
