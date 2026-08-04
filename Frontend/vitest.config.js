import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom', // Emulates a browser environment
    globals: true,
    setupFiles: './src/setupTests.js',
  },
});
