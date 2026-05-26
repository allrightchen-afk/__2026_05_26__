import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import fs from 'fs';

// Native env loader for .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const equalIndex = trimmed.indexOf('=');
      if (equalIndex > 0) {
        const key = trimmed.slice(0, equalIndex).trim();
        const val = trimmed.slice(equalIndex + 1).trim().replace(/^['"]|['"]$/g, '');
        if (key) {
          process.env[key] = val;
        }
      }
    }
  });
}

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'api-serverless-middleware',
        configureServer(server) {
          server.middlewares.use(async (req: any, res: any, next) => {
            if (req.url && (req.url.startsWith('/api/generate') || req.url.startsWith('/api/summarize'))) {
              try {
                // Dynamically load the TypeScript API handler
                const { default: handler } = await server.ssrLoadModule('./api/generate.ts');
                
                // Parse incoming request body
                let body = '';
                req.on('data', (chunk: any) => {
                  body += chunk;
                });
                req.on('end', async () => {
                  try {
                    req.body = body ? JSON.parse(body) : {};
                  } catch (e) {
                    req.body = {};
                  }
                  
                  // Mock Express-like response helpers for Serverless Function compatibility
                  res.status = (code: number) => {
                    res.statusCode = code;
                    return res;
                  };
                  res.json = (data: any) => {
                    if (!res.writableEnded) {
                      res.setHeader('Content-Type', 'application/json');
                      res.end(JSON.stringify(data));
                    }
                    return res;
                  };
                  
                  try {
                    await handler(req, res);
                  } catch (err: any) {
                    console.error('Local API Handler Error:', err);
                    if (!res.writableEnded) {
                      res.statusCode = 500;
                      res.setHeader('Content-Type', 'application/json');
                      res.end(JSON.stringify({ error: err.message || 'Internal Server Error' }));
                    }
                  }
                });
              } catch (e: any) {
                console.error('Failed to load local API handler:', e);
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Failed to load local API handler: ' + e.message }));
              }
            } else {
              next();
            }
          });
        }
      }
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
