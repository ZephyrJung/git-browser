import { defineConfig } from 'vite'
import { resolve } from 'path'
import electron from 'vite-plugin-electron'

export default defineConfig({
  plugins: [
    electron([
      {
        // Main process entry
        entry: 'src/main/index.ts',
        onstart: (options) => {
          // Reload app when main process changes
          options.reload()
        },
      },
    ]),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
})
