"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const newsService_1 = require("../services/newsService");
const router = express_1.default.Router();
const newsService = new newsService_1.NewsService();
router.use(auth_1.authenticateToken);
router.get('/', async function (_req, res) {
    try {
        const news = await newsService.getAllNews();
        return res.json(news);
    }
    catch (e) {
        console.error('Ошибка get news:', e);
        return res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
});
router.get('/:id', async function (req, res) {
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
    }
    catch (e) {
        console.error('Ошибка get news by id:', e);
        return res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
});
router.post('/', validation_1.validateNewsCreate, async function (req, res) {
    try {
        const authorId = req.user?.id;
        if (!authorId)
            return res.status(401).json({ error: 'Не авторизован' });
        const created = await newsService.createNews(authorId, req.body);
        return res.status(201).json(created);
    }
    catch (e) {
        console.error('Ошибка create news:', e);
        return res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
});
router.put('/:id', validation_1.validateNewsUpdate, async function (req, res) {
    try {
        const authorId = req.user?.id;
        if (!authorId)
            return res.status(401).json({ error: 'Не авторизован' });
        const id = Number(req.params.id);
        if (!Number.isFinite(id) || !Number.isInteger(id)) {
            return res.status(400).json({ error: 'Некорректный id' });
        }
        const updated = await newsService.updateNews(id, authorId, req.body);
        return res.json(updated);
    }
    catch (e) {
        console.error('Ошибка update news:', e);
        const message = e?.message || 'Ошибка';
        const status = message.includes('у вас нет прав') ? 403 : 404;
        return res.status(status).json({ error: message });
    }
});
router.delete('/:id', async function (req, res) {
    try {
        const authorId = req.user?.id;
        if (!authorId)
            return res.status(401).json({ error: 'Не авторизован' });
        const id = Number(req.params.id);
        if (!Number.isFinite(id) || !Number.isInteger(id)) {
            return res.status(400).json({ error: 'Некорректный id' });
        }
        await newsService.deleteNews(id, authorId);
        return res.status(204).send();
    }
    catch (e) {
        console.error('Ошибка delete news:', e);
        const message = e?.message || 'Ошибка';
        const status = message.includes('у вас нет прав') ? 403 : 404;
        return res.status(status).json({ error: message });
    }
});
exports.default = router;
