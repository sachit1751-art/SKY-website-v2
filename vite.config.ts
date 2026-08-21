import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
      dedupe: ['react', 'react-dom', 'react-router-dom', 'motion'],
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom', 'motion', 'motion/react'],
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    build: {
      chunkSizeWarningLimit: 1200,
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            'vendor-motion': ['motion', 'motion/react'],
            'vendor-supabase': ['@supabase/supabase-js'],
            'admin-core': [
              './src/pages/admin/DashboardPage.tsx',
              './src/pages/admin/RomEditorPage.tsx',
              './src/pages/admin/FeedbackAdminPage.tsx',
              './src/pages/admin/SecurityLogsPage.tsx',
              './src/pages/admin/ApproveAdminsPage.tsx',
            ],
            'admin-auth': [
              './src/pages/admin/LoginPage.tsx',
              './src/pages/admin/RegisterPage.tsx',
              './src/pages/admin/ResetPasswordPage.tsx',
            ]
          }
        }
      }
    }
  };
});
