import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // Puerto del frontend (distinto al backend que corre en 3000)
    proxy: {
      // Redirigir llamadas a la API al backend
      '/api': {
        target: 'http://localhost:3000', // URL del backend
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''), // Opcional: remueve '/api' si no lo usas en las rutas del backend
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // Alias para rutas más limpias
    },
  },
  build: {
    outDir: 'dist', // Carpeta de salida para archivos de producción
  },
});
