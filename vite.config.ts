import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  build: {
    outDir: './dist',  // Archivos de producción generados en la carpeta dist
  },
  server: {
    port: 5173,  // Puerto del servidor de desarrollo
    open: true,  // Abre el navegador automáticamente
  },
  plugins: [react()],
});
