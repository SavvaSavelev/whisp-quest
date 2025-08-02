import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  base: '/whisp-quest/', // обязательно для GitHub Pages
  plugins: [
    tailwindcss(),
    react(),
  ],
});
