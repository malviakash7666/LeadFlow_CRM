import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/geoip': {
        target: 'https://geoip.maxmind.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/geoip/, ''),
      },
    },
  },
})