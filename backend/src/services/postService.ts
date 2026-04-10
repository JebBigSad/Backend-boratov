import prisma from '../db';

export interface CreatePostData {
  title: string;
  content?: string | null;
}

export interface UpdatePostData {
  title?: string;
  content?: string | null;
}

export class PostService {
  async getAllPosts() {
    return prisma.post.findMany({
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

  async getPostById(id: number) {
    return prisma.post.findFirst({
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

  async createPost(authorId: number, data: CreatePostData) {
    return prisma.post.create({
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

  async updatePost(id: number, authorId: number, data: UpdatePostData) {
    const existingPost = await prisma.post.findFirst({
      where: { id, authorId }
    });

    if (!existingPost) {
      throw new Error('Пост не найден или у вас нет прав');
    }

    return prisma.post.update({
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

  async deletePost(id: number, authorId: number) {
    const existingPost = await prisma.post.findFirst({
      where: { id, authorId }
    });

    if (!existingPost) {
      throw new Error('Пост не найден или у вас нет прав');
    }

    await prisma.post.delete({
      where: { id }
    });
  }
}