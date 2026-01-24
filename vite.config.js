import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    build: {
        outDir: 'dist',
        sourcemap: true,
    },
    server: {
        port: 5173,
        host: true,
        proxy: {
            '/api': {
                target: 'https://clean-cloak-b.onrender.com',
                changeOrigin: true,
                secure: true,
            },
        },
    },
});
