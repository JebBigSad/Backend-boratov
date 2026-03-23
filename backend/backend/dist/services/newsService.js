"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewsService = void 0;
const db_1 = __importDefault(require("../db"));
class NewsService {
    async getAllNews() {
        return db_1.default.news.findMany({
            include: {
                author: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                    },
                },
            },
            orderBy: { id: 'desc' },
        });
    }
    async getNewsById(id) {
        return db_1.default.news.findFirst({
            where: { id },
            include: {
                author: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                    },
                },
            },
        });
    }
    async createNews(authorId, data) {
        return db_1.default.news.create({
            data: {
                title: data.title,
                content: data.content ?? null,
                authorId,
            },
            include: {
                author: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                    },
                },
            },
        });
    }
    async updateNews(id, authorId, data) {
        const existing = await db_1.default.news.findFirst({
            where: { id, authorId },
        });
        if (!existing) {
            throw new Error('Новость не найдена или у вас нет прав');
        }
        return db_1.default.news.update({
            where: { id },
            data: {
                title: data.title === undefined ? undefined : data.title,
                content: data.content === undefined ? undefined : data.content,
            },
            include: {
                author: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                    },
                },
            },
        });
    }
    async deleteNews(id, authorId) {
        const existing = await db_1.default.news.findFirst({
            where: { id, authorId },
        });
        if (!existing) {
            throw new Error('Новость не найдена или у вас нет прав');
        }
        await db_1.default.news.delete({
            where: { id },
        });
    }
}
exports.NewsService = NewsService;
