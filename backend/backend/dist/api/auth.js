"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const hashPass_1 = require("../utils/hashPass");
const bcrypt_1 = require("bcrypt");
const db_1 = __importDefault(require("../db"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const router = express_1.default.Router();
// Роут для входа в систему
router.post("/login", async function (req, res) {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: "Email и пароль обязательны" });
        }
        const user = await db_1.default.user.findUnique({
            where: { email }
        });
        if (!user) {
            return res.status(401).json({ error: "Неверные учетные данные" });
        }
        const isValidPassword = await (0, bcrypt_1.compare)(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: "Неверные учетные данные" });
        }
        const token = jsonwebtoken_1.default.sign({
            id: user.id,
            email: user.email,
            username: user.username,
        }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
        return res.status(200).json({
            message: "Вход выполнен успешно",
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });
    }
    catch (e) {
        console.error("Ошибка входа:", e);
        return res.status(500).json({ error: "Внутренняя ошибка сервера" });
    }
});
// Роут для выхода из системы
router.post("/logout", async function (req, res) {
    try {
        return res.status(200).json({ message: "Выход выполнен успешно" });
    }
    catch (e) {
        console.error("Ошибка выхода:", e);
        return res.status(500).json({ error: "Внутренняя ошибка сервера" });
    }
});
// Роут для регистрации нового пользователя
router.post("/register", async function (req, res) {
    try {
        const { username, email, password } = req.body;
        if (!email || !password || !username) {
            return res.status(400).json({ error: "Имя пользователя, email и пароль обязательны" });
        }
        if (password.length < 8) {
            return res.status(400).json({ error: "Пароль должен содержать минимум 8 символов" });
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: "Неверный формат email" });
        }
        const existingUser = await db_1.default.user.findFirst({
            where: {
                OR: [
                    { email },
                    { username }
                ]
            }
        });
        if (existingUser) {
            if (existingUser.email === email) {
                return res.status(409).json({ error: "Email уже зарегистрирован" });
            }
            if (existingUser.username === username) {
                return res.status(409).json({ error: "Имя пользователя уже занято" });
            }
        }
        const hashedPass = await (0, hashPass_1.hashPass)(password);
        const newUser = await db_1.default.user.create({
            data: {
                username,
                email,
                password: hashedPass
            },
            select: {
                id: true,
                username: true,
                email: true,
                createAt: true
            }
        });
        return res.status(201).json({
            message: "Пользователь успешно зарегистрирован",
            user: newUser
        });
    }
    catch (e) {
        console.error("Ошибка регистрации:", e);
        return res.status(500).json({ error: "Внутренняя ошибка сервера" });
    }
});
exports.default = router;
