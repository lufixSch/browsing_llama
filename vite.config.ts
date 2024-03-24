import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        content: 'content.js',
        content_script: 'src/content.ts',
        background: 'background.html',
        index: 'index.html',
        options: 'options.html',
      },
      output: {
        entryFileNames: '[name].js',
      },
    },
  },
});
