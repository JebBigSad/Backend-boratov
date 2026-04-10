import express, { Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { validateNewsCreate, validateNewsUpdate } from '../middleware/validation';
import { NewsService, CreateNewsData, UpdateNewsData } from '../services/newsService';

const router = express.Router();
const newsService = new NewsService();

router.use(authenticateToken);

router.get('/', async function (_req: Request, res: Response) {
  try {
    const news = await newsService.getAllNews();
    return res.json(news);
  } catch (e) {
    console.error('Ошибка get news:', e);
    return res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

router.get('/:id', async function (req: Request<{ id: string }>, res: Response) {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id) || !Number.isInteger(id)) {
      return res.status(400).json({ error: 'Некорректный id' });
    }

    const item = await newsService.getNewsById(id);
    if (!item) {
      return res.status(404).json({ error: 'Новость не найдена' });
    }

    return res.json(item);
  } catch (e) {
    console.error('Ошибка get news by id:', e);
    return res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

router.post(
  '/',
  validateNewsCreate,
  async function (req: Request<{}, {}, CreateNewsData>, res: Response) {
    try {
      const authorId = req.user?.id;
      if (!authorId) return res.status(401).json({ error: 'Не авторизован' });

      const created = await newsService.createNews(authorId, req.body);
      return res.status(201).json(created);
    } catch (e) {
      console.error('Ошибка create news:', e);
      return res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
  }
);

router.put(
  '/:id',
  validateNewsUpdate,
  async function (req: Request<{ id: string }, {}, UpdateNewsData>, res: Response) {
    try {
      const authorId = req.user?.id;
      if (!authorId) return res.status(401).json({ error: 'Не авторизован' });

      const id = Number(req.params.id);
      if (!Number.isFinite(id) || !Number.isInteger(id)) {
        return res.status(400).json({ error: 'Некорректный id' });
      }

      const updated = await newsService.updateNews(id, authorId, req.body);
      return res.json(updated);
    } catch (e: any) {
      console.error('Ошибка update news:', e);
      const message = e?.message || 'Ошибка';
      const status = message.includes('у вас нет прав') ? 403 : 404;
      return res.status(status).json({ error: message });
    }
  }
);

router.delete('/:id', async function (req: Request<{ id: string }>, res: Response) {
  try {
    const authorId = req.user?.id;
    if (!authorId) return res.status(401).json({ error: 'Не авторизован' });

    const id = Number(req.params.id);
    if (!Number.isFinite(id) || !Number.isInteger(id)) {
      return res.status(400).json({ error: 'Некорректный id' });
    }

    await newsService.deleteNews(id, authorId);
    return res.status(204).send();
  } catch (e: any) {
    console.error('Ошибка delete news:', e);
    const message = e?.message || 'Ошибка';
    const status = message.includes('у вас нет прав') ? 403 : 404;
    return res.status(status).json({ error: message });
  }
});

export default router;

