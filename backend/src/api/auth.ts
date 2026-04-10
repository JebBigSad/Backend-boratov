import express, { Request, Response } from "express";
import { hashPass } from "../utils/hashPass";
import { compare } from "bcrypt"; 
import prisma from "../db";
import jwt from 'jsonwebtoken';

interface RegisterBody {
  username?: string;
  email?: string;
  password?: string;
}

interface LoginBody {
  email?: string;
  password?: string;
}

const router = express.Router();

// Роут для входа в систему
router.post("/login", async function (req: Request<{}, {}, LoginBody>, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email и пароль обязательны" });
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({ error: "Неверные учетные данные" });
    }

    const isValidPassword = await compare(password, user.password);
    
    if (!isValidPassword) {
      return res.status(401).json({ error: "Неверные учетные данные" });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        username: user.username,
      },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' },
    );

    return res.status(200).json({ 
      message: "Вход выполнен успешно",
      token,
      user: { 
        id: user.id, 
        username: user.username, 
        email: user.email 
      }
    });
    
  } catch (e) {
    console.error("Ошибка входа:", e);
    return res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
});

// Роут для выхода из системы
router.post("/logout", async function (req: Request, res: Response) {
  try {
    return res.status(200).json({ message: "Выход выполнен успешно" });
  } catch (e) {
    console.error("Ошибка выхода:", e);
    return res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
});

// Роут для регистрации нового пользователя
router.post("/register", async function (req: Request<{}, {}, RegisterBody>, res: Response) {
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

    const existingUser = await prisma.user.findFirst({
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
    
    const hashedPass = await hashPass(password);

    const newUser = await prisma.user.create({
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
    
  } catch (e) {
    console.error("Ошибка регистрации:", e);
    return res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
});

export default router;