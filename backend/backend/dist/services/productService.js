"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductService = void 0;
const db_1 = __importDefault(require("../db"));
class ProductService {
    async getAllProducts() {
        return db_1.default.product.findMany({
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
    async getProductById(id) {
        return db_1.default.product.findFirst({
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
    async createProduct(authorId, data) {
        return db_1.default.product.create({
            data: {
                title: data.title,
                description: data.description ?? null,
                price: data.price ?? null,
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
    async updateProduct(id, authorId, data) {
        const existing = await db_1.default.product.findFirst({
            where: { id, authorId },
        });
        if (!existing) {
            throw new Error('Товар не найден или у вас нет прав');
        }
        return db_1.default.product.update({
            where: { id },
            data: {
                title: data.title === undefined ? undefined : data.title,
                description: data.description === undefined ? undefined : data.description,
                price: data.price === undefined ? undefined : data.price,
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
    async deleteProduct(id, authorId) {
        const existing = await db_1.default.product.findFirst({
            where: { id, authorId },
        });
        if (!existing) {
            throw new Error('Товар не найден или у вас нет прав');
        }
        await db_1.default.product.delete({
            where: { id },
        });
    }
}
exports.ProductService = ProductService;
