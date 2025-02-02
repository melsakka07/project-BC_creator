import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/brave-search': {
        target: 'https://api.search.brave.com/res/v1/web/search',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/brave-search/, ''),
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            // Forward the API key from the client request
            const apiKey = req.headers['x-subscription-token'];
            if (apiKey) {
              proxyReq.setHeader('X-Subscription-Token', apiKey);
            }
          });
        }
      }
    }
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  }
});
