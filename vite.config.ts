import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
// import { nodePolyfills } from "vite-plugin-node-polyfills";

import path from "path";

const src = path.resolve(__dirname, "src");

// https://vitejs.dev/config/
export default defineConfig(async () => ({
  plugins: [
    react(),
  ],

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    watch: {
      // 3. tell vite to ignore watching `src-tauri`
      ignored: ["**/src-tauri/**"],
    },
  },
  
  build: {
    target: "ES2022",
  },
  
  resolve: {
    alias: {
      '@src': src,
      '@modals': path.resolve(src, 'components/modals'),
      '@context': path.resolve(src, "context"),
      '@assets': path.resolve(src, 'assets'),
      '@components': path.resolve(src, 'components'),
      '@util': path.resolve(src, 'util'),
      '@data': path.resolve(src, 'data'),
    }
  }
}
));
