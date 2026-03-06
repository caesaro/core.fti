import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import basicSsl from '@vitejs/plugin-basic-ssl';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 5173, // Sesuaikan dengan port frontend yang biasa Anda gunakan
        host: true, // Mengekspos ke jaringan lokal (misal: akses dari HP)
        proxy: {
          // Semua request ke /api akan diteruskan ke backend di port 5000
          // Contoh: /api/login -> http://localhost:5000/api/login
          '/api': 'http://localhost:5000',
        }
      },
      plugins: [react(), basicSsl()],
      assetsInclude: ['**/*.JPG'],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
