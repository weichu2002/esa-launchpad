import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    plugins: [react()],
    define: {
      // 允许前端代码直接访问 process.env.API_KEY (ESA 环境变量注入)
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    }
  };
});