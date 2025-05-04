import { defineConfig } from "vite";
import path from "path";

// https://vitejs.dev/config
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    }
  },
  build: {
    rollupOptions: {
      external: [
        'electron',
        'playwright',
        '@playwright/test',
        'chromium-bidi',
        'electron-playwright-helpers',
        'patchright',
        'patchright-core',
        'jszip',
        'pako',
        'yaku',
        /^node:.*/,
        /^@electron\/.*/,
        /^@playwright\/.*/
      ],
      output: {
        format: 'cjs',
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]'
      }
    },
    outDir: '.vite/build',
    emptyOutDir: true,
    sourcemap: true,
    minify: false,
    lib: {
      entry: 'src/main.ts',
      formats: ['cjs'],
      fileName: () => 'main.js'
    }
  }
});
