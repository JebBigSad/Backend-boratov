import express, { Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { validatePostCreate, validatePostUpdate } from '../middleware/validation';
import { PostService, CreatePostData, UpdatePostData } from '../services/postService';

const router = express.Router();
const postService = new PostService();

// Все операции с данными постов доступны только авторизованному пользователю
router.use(authenticateToken);

router.get('/', async function (req: Request, res: Response) {
  try {
    const posts = await postService.getAllPosts();
    return res.json(posts);
  } catch (e) {
    console.error('Ошибка get posts:', e);
    return res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

router.get('/:id', async function (req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id) || !Number.isInteger(id)) {
      return res.status(400).json({ error: 'Некорректный id' });
    }

    const post = await postService.getPostById(id);
    if (!post) {
      return res.status(404).json({ error: 'Пост не найден' });
    }

    return res.json(post);
  } catch (e) {
    console.error('Ошибка get post by id:', e);
    return res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

router.post('/', validatePostCreate, async function (req: Request<{}, {}, CreatePostData>, res: Response) {
  try {
    const authorId = req.user?.id;
    if (!authorId) {
      return res.status(401).json({ error: 'Не авторизован' });
    }

    const created = await postService.createPost(authorId, req.body);
    return res.status(201).json(created);
  } catch (e) {
    console.error('Ошибка create post:', e);
    return res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

router.put('/:id', validatePostUpdate, async function (
  req: Request<{ id: string }, {}, UpdatePostData>,
  res: Response
) {
  try {
    const authorId = req.user?.id;
    if (!authorId) {
      return res.status(401).json({ error: 'Не авторизован' });
    }

    const id = Number(req.params.id);
    if (!Number.isFinite(id) || !Number.isInteger(id)) {
      return res.status(400).json({ error: 'Некорректный id' });
    }

    const updated = await postService.updatePost(id, authorId, req.body);
    return res.json(updated);
  } catch (e: any) {
    console.error('Ошибка update post:', e);
    const message = e?.message || 'Ошибка';
    const status = message.includes('у вас нет прав') ? 403 : 404;
    return res.status(status).json({ error: message });
  }
});

router.delete('/:id', async function (req: Request<{ id: string }>, res: Response) {
  try {
    const authorId = req.user?.id;
    if (!authorId) {
      return res.status(401).json({ error: 'Не авторизован' });
    }

    const id = Number(req.params.id);
    if (!Number.isFinite(id) || !Number.isInteger(id)) {
      return res.status(400).json({ error: 'Некорректный id' });
    }

    await postService.deletePost(id, authorId);
    return res.status(204).send();
  } catch (e: any) {
    console.error('Ошибка delete post:', e);
    const message = e?.message || 'Ошибка';
    const status = message.includes('у вас нет прав') ? 403 : 404;
    return res.status(status).json({ error: message });
  }
});

export default router;

