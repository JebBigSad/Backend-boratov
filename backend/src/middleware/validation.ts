import { Request, Response, NextFunction } from 'express';

interface RegisterBody {
  username?: string;
  email?: string;
  password?: string;
}

interface LoginBody {
  email?: string;
  password?: string;
}

export const validateRegister = (req: Request<{}, {}, RegisterBody>, res: Response, next: NextFunction) => {
  const { username, email, password } = req.body;
  
  const errors: string[] = [];

  if (!username) errors.push("Имя пользователя обязательно");
  if (!email) errors.push("Email обязателен");
  if (!password) errors.push("Пароль обязателен");
  
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

export const validateLogin = (req: Request<{}, {}, LoginBody>, res: Response, next: NextFunction) => {
  const { email, password } = req.body;
  
  const errors: string[] = [];

  if (!email) errors.push("Email обязателен");
  if (!password) errors.push("Пароль обязателен");

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};

interface PostCreateBody {
  title?: string;
  content?: string | null;
}

interface PostUpdateBody {
  title?: string;
  content?: string | null;
}

export const validatePostCreate = (req: Request<{}, {}, PostCreateBody>, res: Response, next: NextFunction) => {
  const { title, content } = req.body;
  const errors: string[] = [];

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

export const validatePostUpdate = (req: Request<{}, {}, PostUpdateBody>, res: Response, next: NextFunction) => {
  const { title, content } = req.body;
  const errors: string[] = [];

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

interface ProductCreateBody {
  title?: string;
  description?: string | null;
  price?: number | string | null;
}

interface ProductUpdateBody {
  title?: string;
  description?: string | null;
  price?: number | string | null;
}

export const validateProductCreate = (req: Request<{}, {}, ProductCreateBody>, res: Response, next: NextFunction) => {
  const { title, description, price } = req.body;
  const errors: string[] = [];

  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    errors.push('Поле `title` обязательно');
  }

  if (description !== undefined && description !== null && typeof description !== 'string') {
    errors.push('Поле `description` должно быть строкой или null');
  }

  if (price !== undefined && price !== null) {
    if (typeof price === 'number' && Number.isFinite(price)) {
      // ok
    } else if (typeof price === 'string') {
      const parsed = Number(price);
      if (!Number.isFinite(parsed)) errors.push('Поле `price` должно быть числом');
    } else {
      errors.push('Поле `price` должно быть числом, строкой числа или null');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};

export const validateProductUpdate = (req: Request<{}, {}, ProductUpdateBody>, res: Response, next: NextFunction) => {
  const { title, description, price } = req.body;
  const errors: string[] = [];

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
    } else if (typeof price === 'string') {
      const parsed = Number(price);
      if (!Number.isFinite(parsed)) errors.push('Поле `price` должно быть числом');
    } else {
      errors.push('Поле `price` должно быть числом, строкой числа или null');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};

interface NewsCreateBody {
  title?: string;
  content?: string | null;
}

interface NewsUpdateBody {
  title?: string;
  content?: string | null;
}

export const validateNewsCreate = (req: Request<{}, {}, NewsCreateBody>, res: Response, next: NextFunction) => {
  const { title, content } = req.body;
  const errors: string[] = [];

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

export const validateNewsUpdate = (req: Request<{}, {}, NewsUpdateBody>, res: Response, next: NextFunction) => {
  const { title, content } = req.body;
  const errors: string[] = [];

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