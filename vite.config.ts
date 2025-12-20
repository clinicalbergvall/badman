import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  // Build optimizations
  build: {
    outDir: "dist",
    sourcemap: false,
    minify: "esbuild",
    chunkSizeWarningLimit: 500,

    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          "ui-vendor": ["react-hot-toast", "zod"],
        },
        chunkFileNames: "assets/js/[name]-[hash].js",
        entryFileNames: "assets/js/[name]-[hash].js",
        assetFileNames: "assets/[ext]/[name]-[hash].[ext]",
      },
    },

    target: "es2015",
    cssCodeSplit: true,
    assetsInlineLimit: 4096,
  },

  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "react-hot-toast",
      "zod",
    ],
  },

  server: {
    port: 5173,
    strictPort: false,
    host: true,
  },

  preview: {
    port: 4173,
    strictPort: false,
    host: true,
  },

  esbuild: {
    logOverride: { "this-is-undefined-in-esm": "silent" },
    drop: process.env.NODE_ENV === "production" ? ["console", "debugger"] : [],
  },
});
