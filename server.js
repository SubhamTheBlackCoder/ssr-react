import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { createServer as createViteServer } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function createServer() {
  const app = express();

  // Start Vite in middleware mode
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'custom'
  });

  app.use(vite.middlewares);

  // ✅ Define selective SSR routes
  const ssrRoutes = ['/','/about'];

  app.get('*', async (req, res, next) => {
    const url = req.originalUrl;

    // ✅ Match if route starts with any SSR route
    const shouldSSR = ssrRoutes.some(route =>
      url === route || url.startsWith(route + '/')
    );

    try {
      // 1. Read HTML template
      let template = fs.readFileSync(
        path.resolve(__dirname, 'index.html'),
        'utf-8'
      );

      // 2. Transform using Vite plugins (e.g., HMR, React macros)
      template = await vite.transformIndexHtml(url, template);

      let appHtml = '';

      // 3. Only SSR for matched routes
      if (shouldSSR) {
        const { render } = await vite.ssrLoadModule('/src/entry-server.jsx');
        appHtml = await render(url);
      }

      // 4. Inject rendered HTML into the template
      const html = template.replace(`<!--ssr-outlet-->`, appHtml);

      // 5. Return final HTML
      res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      console.error('❌ SSR Error:', e);
      next(e);
    }
  });

  const PORT = process.env.PORT || 5173;
  app.listen(PORT, () => {
    console.log(`✅ SSR server running at http://localhost:${PORT}`);
  });
}

createServer();
