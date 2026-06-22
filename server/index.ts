import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import dbRoutes from './routes/db.routes';
import atsRoutes from './routes/ats.routes';
import skillsRoutes from './routes/skills.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS from Vite frontend dev server and production domains
app.use(cors({
  origin: '*', // For local development, allow any origin, can restrict in production
  credentials: true,
}));

app.use(express.json());

// Main Routes
app.use('/api/auth', authRoutes);
app.use('/api/db', dbRoutes);
app.use('/api/ats', atsRoutes);
app.use('/api/skills', skillsRoutes);

// Health Check
app.get('/api/health', (req: Request, res: Response) => {
  return res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[Global Error Handler]', err);
  return res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
  });
});

if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`[Server] Express server running on port ${PORT}`);
  });
}

export default app;
