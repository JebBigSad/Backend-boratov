"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateNewsUpdate = exports.validateNewsCreate = exports.validateProductUpdate = exports.validateProductCreate = exports.validatePostUpdate = exports.validatePostCreate = exports.validateLogin = exports.validateRegister = void 0;
const validateRegister = (req, res, next) => {
    const { username, email, password } = req.body;
    const errors = [];
    if (!username)
        errors.push("Имя пользователя обязательно");
    if (!email)
        errors.push("Email обязателен");
    if (!password)
        errors.push("Пароль обязателен");
    if (password && password.length < 8) {
        errors.push("Пароль должен содержать минимум 8 символов");
    }
    if (email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            errors.push("Неверный формат email");
        }
    }
    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }
    next();
};
exports.validateRegister = validateRegister;
const validateLogin = (req, res, next) => {
    const { email, password } = req.body;
    const errors = [];
    if (!email)
        errors.push("Email обязателен");
    if (!password)
        errors.push("Пароль обязателен");
    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }
    next();
};
exports.validateLogin = validateLogin;
const validatePostCreate = (req, res, next) => {
    const { title, content } = req.body;
    const errors = [];
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
        errors.push('Поле `title` обязательно');
    }
    if (content !== undefined && content !== null && typeof content !== 'string') {
        errors.push('Поле `content` должно быть строкой или null');
    }
    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }
    next();
};
exports.validatePostCreate = validatePostCreate;
const validatePostUpdate = (req, res, next) => {
    const { title, content } = req.body;
    const errors = [];
    if (title === undefined && content === undefined) {
        errors.push('Нужно передать хотя бы одно поле для обновления');
    }
    if (title !== undefined && (typeof title !== 'string' || title.trim().length === 0)) {
        errors.push('Поле `title` должно быть непустой строкой');
    }
    if (content !== undefined && content !== null && typeof content !== 'string') {
        errors.push('Поле `content` должно быть строкой или null');
    }
    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }
    next();
};
exports.validatePostUpdate = validatePostUpdate;
const validateProductCreate = (req, res, next) => {
    const { title, description, price } = req.body;
    const errors = [];
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
        errors.push('Поле `title` обязательно');
    }
    if (description !== undefined && description !== null && typeof description !== 'string') {
        errors.push('Поле `description` должно быть строкой или null');
    }
    if (price !== undefined && price !== null) {
        if (typeof price === 'number' && Number.isFinite(price)) {
            // ok
        }
        else if (typeof price === 'string') {
            const parsed = Number(price);
            if (!Number.isFinite(parsed))
                errors.push('Поле `price` должно быть числом');
        }
        else {
            errors.push('Поле `price` должно быть числом, строкой числа или null');
        }
    }
    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }
    next();
};
exports.validateProductCreate = validateProductCreate;
const validateProductUpdate = (req, res, next) => {
    const { title, description, price } = req.body;
    const errors = [];
    if (title === undefined && description === undefined && price === undefined) {
        errors.push('Нужно передать хотя бы одно поле для обновления');
    }
    if (title !== undefined && (typeof title !== 'string' || title.trim().length === 0)) {
        errors.push('Поле `title` должно быть непустой строкой');
    }
    if (description !== undefined && description !== null && typeof description !== 'string') {
        errors.push('Поле `description` должно быть строкой или null');
    }
    if (price !== undefined && price !== null) {
        if (typeof price === 'number' && Number.isFinite(price)) {
            // ok
        }
        else if (typeof price === 'string') {
            const parsed = Number(price);
            if (!Number.isFinite(parsed))
                errors.push('Поле `price` должно быть числом');
        }
        else {
            errors.push('Поле `price` должно быть числом, строкой числа или null');
        }
    }
    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }
    next();
};
exports.validateProductUpdate = validateProductUpdate;
const validateNewsCreate = (req, res, next) => {
    const { title, content } = req.body;
    const errors = [];
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
        errors.push('Поле `title` обязательно');
    }
    if (content !== undefined && content !== null && typeof content !== 'string') {
        errors.push('Поле `content` должно быть строкой или null');
    }
    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }
    next();
};
exports.validateNewsCreate = validateNewsCreate;
const validateNewsUpdate = (req, res, next) => {
    const { title, content } = req.body;
    const errors = [];
    if (title === undefined && content === undefined) {
        errors.push('Нужно передать хотя бы одно поле для обновления');
    }
    if (title !== undefined && (typeof title !== 'string' || title.trim().length === 0)) {
        errors.push('Поле `title` должно быть непустой строкой');
    }
    if (content !== undefined && content !== null && typeof content !== 'string') {
        errors.push('Поле `content` должно быть строкой или null');
    }
    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }
    next();
};
exports.validateNewsUpdate = validateNewsUpdate;
