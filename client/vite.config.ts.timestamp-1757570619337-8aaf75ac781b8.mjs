// vite.config.ts
import { defineConfig } from "file:///C:/Users/Administrator/Sehat%20Kor%20New/FullStack-SehatKor-Website-ash-cloud/client/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/Administrator/Sehat%20Kor%20New/FullStack-SehatKor-Website-ash-cloud/client/node_modules/@vitejs/plugin-react-swc/index.js";
import legacy from "file:///C:/Users/Administrator/Sehat%20Kor%20New/FullStack-SehatKor-Website-ash-cloud/client/node_modules/@vitejs/plugin-legacy/dist/index.mjs";
import path from "path";
import { componentTagger } from "file:///C:/Users/Administrator/Sehat%20Kor%20New/FullStack-SehatKor-Website-ash-cloud/client/node_modules/lovable-tagger/dist/index.js";
var __vite_injected_original_dirname = "C:\\Users\\Administrator\\Sehat Kor New\\FullStack-SehatKor-Website-ash-cloud\\client";
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxBZG1pbmlzdHJhdG9yXFxcXFNlaGF0IEtvciBOZXdcXFxcRnVsbFN0YWNrLVNlaGF0S29yLVdlYnNpdGUtYXNoLWNsb3VkXFxcXGNsaWVudFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcQWRtaW5pc3RyYXRvclxcXFxTZWhhdCBLb3IgTmV3XFxcXEZ1bGxTdGFjay1TZWhhdEtvci1XZWJzaXRlLWFzaC1jbG91ZFxcXFxjbGllbnRcXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL0FkbWluaXN0cmF0b3IvU2VoYXQlMjBLb3IlMjBOZXcvRnVsbFN0YWNrLVNlaGF0S29yLVdlYnNpdGUtYXNoLWNsb3VkL2NsaWVudC92aXRlLmNvbmZpZy50c1wiO2ltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gXCJ2aXRlXCI7XHJcbmltcG9ydCByZWFjdCBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tcmVhY3Qtc3djXCI7XHJcbmltcG9ydCBsZWdhY3kgZnJvbSBcIkB2aXRlanMvcGx1Z2luLWxlZ2FjeVwiO1xyXG5pbXBvcnQgcGF0aCBmcm9tIFwicGF0aFwiO1xyXG5pbXBvcnQgeyBjb21wb25lbnRUYWdnZXIgfSBmcm9tIFwibG92YWJsZS10YWdnZXJcIjtcclxuXHJcbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXHJcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygoeyBtb2RlIH0pID0+ICh7XHJcbiAgc2VydmVyOiB7XHJcbiAgICBob3N0OiBcIjAuMC4wLjBcIixcclxuICAgIHBvcnQ6IDgwODAsXHJcbiAgICBobXI6IHtcclxuICAgICAgaG9zdDogXCJsb2NhbGhvc3RcIixcclxuICAgICAgcHJvdG9jb2w6IFwid3NcIixcclxuICAgICAgcG9ydDogODA4MCxcclxuICAgIH0sXHJcbiAgICBwcm94eToge1xyXG4gICAgICAnL2FwaSc6IHtcclxuICAgICAgICB0YXJnZXQ6ICdodHRwOi8vbG9jYWxob3N0OjQwMDAnLFxyXG4gICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcclxuICAgICAgICBzZWN1cmU6IGZhbHNlLFxyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICB9LFxyXG4gIHBsdWdpbnM6IFtcclxuICAgIHJlYWN0KCksXHJcbiAgICBsZWdhY3koe1xyXG4gICAgICAvLyBUYXJnZXQgYSBicm9hZCBzZXQgb2YgYnJvd3NlcnMgaW5jbHVkaW5nIG9sZGVyIFNhZmFyaS9GaXJlZm94L0VkZ2VcclxuICAgICAgdGFyZ2V0czogW1xyXG4gICAgICAgIFwiZGVmYXVsdHNcIixcclxuICAgICAgICBcIm5vdCBkZWFkXCIsXHJcbiAgICAgICAgXCJpT1MgPj0gMTJcIixcclxuICAgICAgICBcIlNhZmFyaSA+PSAxMlwiLFxyXG4gICAgICAgIFwiRmlyZWZveCA+PSA2OFwiLFxyXG4gICAgICAgIFwiRWRnZSA+PSA3OVwiLFxyXG4gICAgICBdLFxyXG4gICAgICBhZGRpdGlvbmFsTGVnYWN5UG9seWZpbGxzOiBbXCJyZWdlbmVyYXRvci1ydW50aW1lL3J1bnRpbWVcIl0sXHJcbiAgICAgIHJlbmRlckxlZ2FjeUNodW5rczogdHJ1ZSxcclxuICAgICAgbW9kZXJuUG9seWZpbGxzOiB0cnVlLFxyXG4gICAgfSksXHJcbiAgICBtb2RlID09PSAnZGV2ZWxvcG1lbnQnICYmXHJcbiAgICBjb21wb25lbnRUYWdnZXIoKSxcclxuICBdLmZpbHRlcihCb29sZWFuKSxcclxuICByZXNvbHZlOiB7XHJcbiAgICBhbGlhczoge1xyXG4gICAgICBcIkBcIjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuL3NyY1wiKSxcclxuICAgIH0sXHJcbiAgfSxcclxuICBlc2J1aWxkOiB7XHJcbiAgICB0YXJnZXQ6IFwiZXMyMDE3XCIsXHJcbiAgfSxcclxuICBidWlsZDoge1xyXG4gICAgLy8gVHJhbnNwaWxlIGRvd24gdG8gYnJvYWRseSBzdXBwb3J0ZWQgc3ludGF4XHJcbiAgICB0YXJnZXQ6IFwiZXMyMDE3XCIsXHJcbiAgICBjc3NUYXJnZXQ6IFtcImNocm9tZTYxXCIsIFwic2FmYXJpMTFcIiwgXCJmaXJlZm94NjBcIl0sXHJcbiAgfSxcclxufSkpO1xyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQWtiLFNBQVMsb0JBQW9CO0FBQy9jLE9BQU8sV0FBVztBQUNsQixPQUFPLFlBQVk7QUFDbkIsT0FBTyxVQUFVO0FBQ2pCLFNBQVMsdUJBQXVCO0FBSmhDLElBQU0sbUNBQW1DO0FBT3pDLElBQU8sc0JBQVEsYUFBYSxDQUFDLEVBQUUsS0FBSyxPQUFPO0FBQUEsRUFDekMsUUFBUTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sS0FBSztBQUFBLE1BQ0gsTUFBTTtBQUFBLE1BQ04sVUFBVTtBQUFBLE1BQ1YsTUFBTTtBQUFBLElBQ1I7QUFBQSxJQUNBLE9BQU87QUFBQSxNQUNMLFFBQVE7QUFBQSxRQUNOLFFBQVE7QUFBQSxRQUNSLGNBQWM7QUFBQSxRQUNkLFFBQVE7QUFBQSxNQUNWO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLE1BQU07QUFBQSxJQUNOLE9BQU87QUFBQTtBQUFBLE1BRUwsU0FBUztBQUFBLFFBQ1A7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLE1BQ0Y7QUFBQSxNQUNBLDJCQUEyQixDQUFDLDZCQUE2QjtBQUFBLE1BQ3pELG9CQUFvQjtBQUFBLE1BQ3BCLGlCQUFpQjtBQUFBLElBQ25CLENBQUM7QUFBQSxJQUNELFNBQVMsaUJBQ1QsZ0JBQWdCO0FBQUEsRUFDbEIsRUFBRSxPQUFPLE9BQU87QUFBQSxFQUNoQixTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsTUFDTCxLQUFLLEtBQUssUUFBUSxrQ0FBVyxPQUFPO0FBQUEsSUFDdEM7QUFBQSxFQUNGO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUCxRQUFRO0FBQUEsRUFDVjtBQUFBLEVBQ0EsT0FBTztBQUFBO0FBQUEsSUFFTCxRQUFRO0FBQUEsSUFDUixXQUFXLENBQUMsWUFBWSxZQUFZLFdBQVc7QUFBQSxFQUNqRDtBQUNGLEVBQUU7IiwKICAibmFtZXMiOiBbXQp9Cg==
