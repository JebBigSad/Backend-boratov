import express, { Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  validateProductCreate,
  validateProductUpdate,
} from '../middleware/validation';
import {
  ProductService,
  CreateProductData,
  UpdateProductData,
} from '../services/productService';

const router = express.Router();
const productService = new ProductService();

router.use(authenticateToken);

function normalizeNullableInt(value: unknown): number | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

router.get('/', async function (_req: Request, res: Response) {
  try {
    const products = await productService.getAllProducts();
    return res.json(products);
  } catch (e) {
    console.error('Ошибка get products:', e);
    return res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

router.get('/:id', async function (req: Request<{ id: string }>, res: Response) {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id) || !Number.isInteger(id)) {
      return res.status(400).json({ error: 'Некорректный id' });
    }

    const product = await productService.getProductById(id);
    if (!product) {
      return res.status(404).json({ error: 'Товар не найден' });
    }

    return res.json(product);
  } catch (e) {
    console.error('Ошибка get product by id:', e);
    return res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

router.post(
  '/',
  validateProductCreate,
  async function (req: Request<{}, {}, CreateProductData>, res: Response) {
    try {
      const authorId = req.user?.id;
      if (!authorId) return res.status(401).json({ error: 'Не авторизован' });

      const price = normalizeNullableInt((req.body as any).price);

      const created = await productService.createProduct(authorId, {
        title: req.body.title,
        description: req.body.description ?? null,
        price,
      });

      return res.status(201).json(created);
    } catch (e) {
      console.error('Ошибка create product:', e);
      return res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
  }
);

router.put(
  '/:id',
  validateProductUpdate,
  async function (req: Request<{ id: string }, {}, UpdateProductData>, res: Response) {
    try {
      const authorId = req.user?.id;
      if (!authorId) return res.status(401).json({ error: 'Не авторизован' });

      const id = Number(req.params.id);
      if (!Number.isFinite(id) || !Number.isInteger(id)) {
        return res.status(400).json({ error: 'Некорректный id' });
      }

      const bodyAny = req.body as any;
      const price = normalizeNullableInt(bodyAny.price);

      const updated = await productService.updateProduct(id, authorId, {
        title: req.body.title,
        description: req.body.description,
        price,
      });

      return res.json(updated);
    } catch (e: any) {
      console.error('Ошибка update product:', e);
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

    await productService.deleteProduct(id, authorId);
    return res.status(204).send();
  } catch (e: any) {
    console.error('Ошибка delete product:', e);
    const message = e?.message || 'Ошибка';
    const status = message.includes('у вас нет прав') ? 403 : 404;
    return res.status(status).json({ error: message });
  }
});

export default router;

