"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const auth_1 = __importDefault(require("./api/auth"));
const posts_1 = __importDefault(require("./api/posts"));
const products_1 = __importDefault(require("./api/products"));
const news_1 = __importDefault(require("./api/news"));
const app = (0, express_1.default)();
// Глобальные мидлвары
app.use((0, helmet_1.default)()); // Безопасность
app.use((0, morgan_1.default)('dev')); // Логирование
app.use(express_1.default.json({ limit: '10mb' })); // Парсинг JSON
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
}));
// Роуты
app.use('/api/auth', auth_1.default);
app.use('/api/posts', posts_1.default);
app.use('/api/products', products_1.default);
app.use('/api/news', news_1.default);
// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});
// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Маршрут не найден' });
});
// Error handler
app.use((err, req, res, next) => {
    console.error('Ошибка:', err.stack);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
    console.log(`📝 Режим: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 CORS разрешен для: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
});
exports.default = app;
