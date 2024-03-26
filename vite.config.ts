import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        content: 'content.js',
        content_script: 'src/content.ts',
        summary_box: 'src/summary_box.css',
        background: 'background.html',
        index: 'index.html',
        options: 'options.html',
      },
      output: {
        entryFileNames: '[name].js',
        assetFileNames: '[name][extname]',
      },
    },
  },
});
