import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        content: 'src/content.ts',
        background: 'src/background.ts',
        index: 'index.html',
        options: 'options.html',
      },
      output: {
        entryFileNames: '[name].js',
      },
    },
  },
});
