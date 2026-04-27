const socketIO = require("socket.io");
const jwt = require("jsonwebtoken");

let io;
const JWT_FALLBACK_SECRET = "development_only_change_me";

function getJwtSecret() {
  return process.env.JWT_SECRET || JWT_FALLBACK_SECRET;
}

function initSocket(server) {
  io = socketIO(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://127.0.0.1:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("🔌 Пользователь подключился:", socket.id);

    // Регистрация пользователя
    socket.on("support:register", (userData = {}) => {
      try {
        const decoded = jwt.verify(userData.token, getJwtSecret());
        socket.userId = decoded.id;
        socket.userRole = decoded.role || "client";
        socket.userName = decoded.username || decoded.email || "user";
        console.log(
          `✅ Пользователь зарегистрирован: ${socket.userName} (${socket.userRole})`
        );
      } catch (error) {
        socket.emit("support:error", { error: "Недействительный токен" });
      }
    });

    // Присоединиться к комнате тикета
    socket.on("support:joinTicket", (ticketId) => {
      if (!socket.userId) {
        socket.emit("support:error", { error: "Требуется авторизация" });
        return;
      }
      socket.join(`ticket_${ticketId}`);
      console.log(
        `📌 Пользователь ${socket.userName} присоединился к тикету ${ticketId}`
      );
    });

    // Отправить сообщение
    socket.on("support:sendMessage", async (data) => {
      if (!socket.userId) {
        socket.emit("support:error", { error: "Требуется авторизация" });
        return;
      }
      const { ticketId, text } = data;

      const message = {
        id: Date.now().toString(),
        ticketId,
        text: String(text || "").trim(),
        authorId: socket.userId,
        authorName: socket.userName,
        authorRole: socket.userRole,
        createdAt: Date.now(),
      };
      if (!message.text) {
        return;
      }

      // Отправляем сообщение всем в комнате
      io.to(`ticket_${ticketId}`).emit("support:newMessage", message);
      console.log(
        `💬 Сообщение в тикете ${ticketId} от ${socket.userName}: ${message.text}`
      );
    });

    socket.on("disconnect", () => {
      console.log("🔌 Пользователь отключился:", socket.id);
    });
  });

  return io;
}

module.exports = { initSocket, getIO: () => io };
