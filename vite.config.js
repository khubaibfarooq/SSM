import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'url';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.tsx',
            refresh: true,
        }),
        react(),
    ],

    resolve: {
        alias: {
            "@assets": fileURLToPath(new URL('resources/', import.meta.url)),
            "@": fileURLToPath(new URL('resources/js/', import.meta.url)),
        }
    },

    optimizeDeps: {
        include: [
            'react-apexcharts',
            'react-flatpickr',
            'react-countup',
            'react-beautiful-dnd',
            'react-color',
            'react-dragula',
            'react-dual-listbox',
            'react-scrollspy',
        ],
    },

    build: {
        commonjsOptions: {
            transformMixedEsModules: true,
        },
    },

    css: {
        preprocessorOptions: {
            scss: {
                // Silence Bootstrap 5.x legacy color function deprecation warnings
                // (red(), green(), blue() calls in bootstrap/scss/_functions.scss)
                silenceDeprecations: ['color-functions', 'global-builtin', 'import'],
            },
        },
    },
});