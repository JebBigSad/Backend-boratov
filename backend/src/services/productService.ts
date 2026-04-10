import prisma from '../db';

export interface CreateProductData {
  title: string;
  description?: string | null;
  price?: number | null;
}

export interface UpdateProductData {
  title?: string;
  description?: string | null;
  price?: number | null;
}

export class ProductService {
  async getAllProducts() {
    return prisma.product.findMany({
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

  async getProductById(id: number) {
    return prisma.product.findFirst({
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

  async createProduct(authorId: number, data: CreateProductData) {
    return prisma.product.create({
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

  async updateProduct(id: number, authorId: number, data: UpdateProductData) {
    const existing = await prisma.product.findFirst({
      where: { id, authorId },
    });

    if (!existing) {
      throw new Error('Товар не найден или у вас нет прав');
    }

    return prisma.product.update({
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

  async deleteProduct(id: number, authorId: number) {
    const existing = await prisma.product.findFirst({
      where: { id, authorId },
    });

    if (!existing) {
      throw new Error('Товар не найден или у вас нет прав');
    }

    await prisma.product.delete({
      where: { id },
    });
  }
}

