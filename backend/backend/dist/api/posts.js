"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const postService_1 = require("../services/postService");
const router = express_1.default.Router();
const postService = new postService_1.PostService();
// Все операции с данными постов доступны только авторизованному пользователю
router.use(auth_1.authenticateToken);
router.get('/', async function (req, res) {
    try {
        const posts = await postService.getAllPosts();
        return res.json(posts);
    }
    catch (e) {
        console.error('Ошибка get posts:', e);
        return res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
});
router.get('/:id', async function (req, res) {
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
    }
    catch (e) {
        console.error('Ошибка get post by id:', e);
        return res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
});
router.post('/', validation_1.validatePostCreate, async function (req, res) {
    try {
        const authorId = req.user?.id;
        if (!authorId) {
            return res.status(401).json({ error: 'Не авторизован' });
        }
        const created = await postService.createPost(authorId, req.body);
        return res.status(201).json(created);
    }
    catch (e) {
        console.error('Ошибка create post:', e);
        return res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
});
router.put('/:id', validation_1.validatePostUpdate, async function (req, res) {
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
    }
    catch (e) {
        console.error('Ошибка update post:', e);
        const message = e?.message || 'Ошибка';
        const status = message.includes('у вас нет прав') ? 403 : 404;
        return res.status(status).json({ error: message });
    }
});
router.delete('/:id', async function (req, res) {
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
    }
    catch (e) {
        console.error('Ошибка delete post:', e);
        const message = e?.message || 'Ошибка';
        const status = message.includes('у вас нет прав') ? 403 : 404;
        return res.status(status).json({ error: message });
    }
});
exports.default = router;
