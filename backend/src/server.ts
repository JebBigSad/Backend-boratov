import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import http from 'http';
import authRouter from './api/auth';
import postsRouter from './api/posts';
import productsRouter from './api/products';
import newsRouter from './api/news';
import supportRouter from './api/support';
const { initSocket } = require('./socket');

const app = express();

app.use(helmet());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(cors({ 
  origin: process.env.CLIENT_URL || 'http://127.0.0.1:3000',
  credentials: true 
}));

app.use('/api/auth', authRouter);
app.use('/api/posts', postsRouter);
app.use('/api/products', productsRouter);
app.use('/api/news', newsRouter);
app.use('/api/support', supportRouter);

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Маршрут не найден' });
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Ошибка:', err.stack);
  res.status(500).json({ error: 'Внутренняя ошибка сервера' });
});

const PORT = process.env.PORT || 3001;

// Создаём HTTP сервер
const server = http.createServer(app);

// Инициализируем Socket.IO
initSocket(server);

server.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
  console.log(`🔌 WebSocket сервер запущен на порту ${PORT}`);
});

export default app;