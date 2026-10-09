import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { authRouter } from './server/routes/auth.js';
import { listingsRouter } from './server/routes/listings.js';
import { categoriesRouter } from './server/routes/categories.js';
import { wishlistRouter } from './server/routes/wishlist.js';
import { enquiriesRouter } from './server/routes/enquiries.js';
import { reportsRouter } from './server/routes/reports.js';
import { adminRouter } from './server/routes/admin.js';
import { aiRouter } from './server/routes/ai.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body parser with 10MB limit for image uploads
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // REST API Routes
  app.use('/api/auth', authRouter);
  app.use('/api/listings', listingsRouter);
  app.use('/api/categories', categoriesRouter);
  app.use('/api/wishlist', wishlistRouter);
  app.use('/api/enquiries', enquiriesRouter);
  app.use('/api/reports', reportsRouter);
  app.use('/api/admin', adminRouter);
  app.use('/api/ai', aiRouter);

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'CampusCart API', timestamp: new Date().toISOString() });
  });

  // Static items / public assets
  app.use(express.static(path.resolve(__dirname, 'public')));

  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
    });
  } else {
    // Dynamic import of Vite in development
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false, ws: false },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`CampusCart full-stack server running on port ${PORT} [env=${process.env.NODE_ENV || 'development'}]`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`[Server] Port ${PORT} is temporarily in use. Waiting to rebind...`);
      setTimeout(() => {
        server.close();
        app.listen(PORT, '0.0.0.0', () => {
          console.log(`CampusCart full-stack server re-bound on port ${PORT}`);
        });
      }, 1000);
    } else {
      console.error('[Server] Unhandled server error:', err);
    }
  });

  const handleShutdown = () => {
    server.close(() => {
      process.exit(0);
    });
  };

  process.on('SIGTERM', handleShutdown);
  process.on('SIGINT', handleShutdown);
}

startServer().catch((err) => {
  console.error('Fatal error starting server:', err);
  process.exit(1);
});

