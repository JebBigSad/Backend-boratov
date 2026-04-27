import { Router } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { getJwtSecret, signJwt } from "../utils/jwt";
import prisma from "../db";

const router = Router();

// Регистрация
router.post("/register", async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Пароли не совпадают" });
    }

    const normalizedEmail = email || `${username}@example.com`;
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email: normalizedEmail }],
      },
    });
    if (existingUser) {
      return res.status(400).json({ error: "Пользователь уже существует" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        username,
        email: normalizedEmail,
        password: hashedPassword,
        role: "client",
      },
    });

    const token = signJwt({
      id: newUser.id,
      username,
      email: normalizedEmail,
      role: newUser.role,
    });

    res.json({
      token,
      user: {
        id: newUser.id,
        username,
        email: newUser.email,
        role: newUser.role,
        bio: "",
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Ошибка регистрации" });
  }
});

// Вход
router.post("/login", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const identifier = (username || email || "").trim();
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ username: identifier }, { email: identifier }],
      },
    });

    if (!user) {
      return res.status(401).json({ error: "Неверные учетные данные" });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: "Неверные учетные данные" });
    }

    const token = signJwt({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    });

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role || "client",
        bio: "",
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Ошибка входа" });
  }
});

// Получить профиль
router.get("/profile", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Нет токена" });
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret()) as any;
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) {
      return res.status(404).json({ error: "Пользователь не найден" });
    }
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      bio: "",
    });
  } catch (error) {
    res.status(401).json({ error: "Недействительный токен" });
  }
});

// Обновить профиль
router.put("/profile", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Нет токена" });
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret()) as any;
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) {
      return res.status(404).json({ error: "Пользователь не найден" });
    }

    const { username, email, bio } = req.body;
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(username ? { username } : {}),
        ...(email ? { email } : {}),
      },
    });

    res.json({
      id: updated.id,
      username: updated.username,
      email: updated.email,
      role: updated.role,
      bio: bio ?? "",
    });
  } catch (error) {
    console.error(error);
    res.status(401).json({ error: "Недействительный токен" });
  }
});

export default router;
