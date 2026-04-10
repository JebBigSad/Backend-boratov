import prisma from '../db';

export interface CreateNewsData {
  title: string;
  content?: string | null;
}

export interface UpdateNewsData {
  title?: string;
  content?: string | null;
}

export class NewsService {
  async getAllNews() {
    return prisma.news.findMany({
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

  async getNewsById(id: number) {
    return prisma.news.findFirst({
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

  async createNews(authorId: number, data: CreateNewsData) {
    return prisma.news.create({
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

  async updateNews(id: number, authorId: number, data: UpdateNewsData) {
    const existing = await prisma.news.findFirst({
      where: { id, authorId },
    });

    if (!existing) {
      throw new Error('Новость не найдена или у вас нет прав');
    }

    return prisma.news.update({
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

  async deleteNews(id: number, authorId: number) {
    const existing = await prisma.news.findFirst({
      where: { id, authorId },
    });

    if (!existing) {
      throw new Error('Новость не найдена или у вас нет прав');
    }

    await prisma.news.delete({
      where: { id },
    });
  }
}

