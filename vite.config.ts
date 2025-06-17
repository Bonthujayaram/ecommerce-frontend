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
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom'],
          'icons': ['lucide-react'],
        },
      },
    },
  },
  server: {
    host: true,
    port: 5173,
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'lucide-react'],
  },
});
