import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import authRouter from './api/auth';
import postsRouter from './api/posts';
import productsRouter from './api/products';
import newsRouter from './api/news';

const app = express();

// Глобальные мидлвары
app.use(helmet()); // Безопасность
app.use(morgan('dev')); // Логирование
app.use(express.json({ limit: '10mb' })); // Парсинг JSON
app.use(cors({ 
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true 
}));

// Роуты
app.use('/api/auth', authRouter);
app.use('/api/posts', postsRouter);
app.use('/api/products', productsRouter);
app.use('/api/news', newsRouter);

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Маршрут не найден' });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Ошибка:', err.stack);
  res.status(500).json({ error: 'Внутренняя ошибка сервера' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
  console.log(`📝 Режим: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 CORS разрешен для: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
});

export default app;