import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import legacy from "@vitejs/plugin-legacy";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "0.0.0.0",
    port: 8080,
    hmr: {
      host: "localhost",
      protocol: "ws",
      port: 8080,
    },
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
        "Edge >= 79",
      ],
      additionalLegacyPolyfills: ["regenerator-runtime/runtime"],
      renderLegacyChunks: true,
      modernPolyfills: true,
    }),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  esbuild: {
    target: "es2017",
  },
  build: {
    // Transpile down to broadly supported syntax
    target: "es2017",
    cssTarget: ["chrome61", "safari11", "firefox60"],
  },
}));
