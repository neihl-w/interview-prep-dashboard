import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/interview-prep-dashboard/',
  plugins: [react()],
  test: {
    environment: 'node',
  },
});
