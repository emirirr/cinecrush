import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(() => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      injectRegister: 'auto',
      includeAssets: ['favicon.ico', 'robots.txt', 'placeholder.svg'],
      manifest: {
        name: 'Cinecrush',
        short_name: 'Cinecrush',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        background_color: '#000000',
        theme_color: '#111827',
        description: 'Match with fellow movie enthusiasts based on your favorite films.',
        icons: [
          { src: '/favicon.ico', sizes: 'any', type: 'image/x-icon' },
          { src: '/placeholder.svg', sizes: '192x192', type: 'image/svg+xml', purpose: 'any' },
          { src: '/placeholder.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'any' },
          { src: '/placeholder.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg}'],
        runtimeCaching: [
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images',
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 }
            }
          }
        ]
      },
      // Disable SW during dev HMR to reduce noisy workbox logs
      devOptions: { enabled: false }
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
