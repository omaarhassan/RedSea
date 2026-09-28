import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    build: {
      chunkSizeWarningLimit: 1200,
      rollupOptions: {
        onwarn(warning, warn) {
          if (warning.code === 'INVALID_ANNOTATION') return;
          warn(warning);
        },
        output: {
          manualChunks(id) {
            // Isolate Supabase
            if (id.includes('node_modules/@supabase')) {
              return 'supabase';
            }
            // Isolate Icon sets
            if (id.includes('node_modules/lucide-react') || id.includes('node_modules/react-icons')) {
              return 'ui-icons';
            }
            // Isolate i18n
            if (id.includes('node_modules/i18next') || id.includes('node_modules/react-i18next')) {
              return 'i18n';
            }
            // Group all other packages (including React and Router) in vendor to stop the loop
            if (id.includes('node_modules/')) {
              return 'vendor';
            }
          },
        },
      },
    },
  };
});