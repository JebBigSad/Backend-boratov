"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostService = void 0;
const db_1 = __importDefault(require("../db"));
class PostService {
    async getAllPosts() {
        return db_1.default.post.findMany({
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
    async getPostById(id) {
        return db_1.default.post.findFirst({
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
    async createPost(authorId, data) {
        return db_1.default.post.create({
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
    async updatePost(id, authorId, data) {
        const existingPost = await db_1.default.post.findFirst({
            where: { id, authorId }
        });
        if (!existingPost) {
            throw new Error('Пост не найден или у вас нет прав');
        }
        return db_1.default.post.update({
            where: { id },
            data,
            include: {
                author: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                    },
                },
            }
        });
    }
    async deletePost(id, authorId) {
        const existingPost = await db_1.default.post.findFirst({
            where: { id, authorId }
        });
        if (!existingPost) {
            throw new Error('Пост не найден или у вас нет прав');
        }
        await db_1.default.post.delete({
            where: { id }
        });
    }
}
exports.PostService = PostService;
