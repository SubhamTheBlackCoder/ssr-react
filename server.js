import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function createServer() {
  const app = express();
  const isProd = process.env.NODE_ENV === 'production';

  let vite;
  let template;
  let render;

  if (isProd) {
    app.use(express.static(path.join(__dirname, 'dist/client'), { index: false }));
    template = fs.readFileSync(path.join(__dirname, 'dist/client/index.html'), 'utf-8');
    const ssrModule = await import(path.join(__dirname, 'dist/server/entry-server.js'));
    render = ssrModule.render;
  } else {
    const { createServer: createViteServer } = await import('vite');
    vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
    app.use(vite.middlewares);
    template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
  }

  const ssrRoutes = ['/', '/about'];

  app.get('*', async (req, res, next) => {
    const url = req.originalUrl;
    const shouldSSR = ssrRoutes.some(route => 
      url === route || url.startsWith(`${route}/`)
    );

    try {
      let appHtml = '';
      let html = template;

      if (!isProd) {
        html = await vite.transformIndexHtml(url, html);
      }

      if (shouldSSR) {
        if (isProd) {
          appHtml = await render(url);
        } else {
          const { render: devRender } = await vite.ssrLoadModule('/src/entry-server.jsx');
          appHtml = devRender(url);
        }
      }

      html = html.replace('<!--ssr-outlet-->', appHtml);
      res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
    } catch (e) {
      if (!isProd) vite.ssrFixStacktrace(e);
      console.error('❌ SSR Error:', e);
      next(e);
    }
  });

  const PORT = process.env.PORT || 5173;
  app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
    console.log(`Mode: ${isProd ? 'production' : 'development'}`);
  });
}

createServer();