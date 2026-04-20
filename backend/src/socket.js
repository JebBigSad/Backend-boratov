const socketIO = require('socket.io');

let io;

function initSocket(server) {
  io = socketIO(server, {
    cors: {
      origin: "http://127.0.0.1:3000",
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log('🔌 Пользователь подключился:', socket.id);

    // Регистрация пользователя
    socket.on('support:register', (userData) => {
      socket.userId = userData.userId;
      socket.userRole = userData.role;
      socket.userName = userData.name;
      console.log(`✅ Пользователь зарегистрирован: ${userData.name} (${userData.role})`);
    });

    // Присоединиться к комнате тикета
    socket.on('support:joinTicket', (ticketId) => {
      socket.join(`ticket_${ticketId}`);
      console.log(`📌 Пользователь ${socket.userName} присоединился к тикету ${ticketId}`);
    });

    // Отправить сообщение
    socket.on('support:sendMessage', async (data) => {
      const { ticketId, text, userId, userName, userRole } = data;
      
      const message = {
        id: Date.now().toString(),
        ticketId,
        text,
        authorId: userId,
        authorName: userName,
        authorRole: userRole,
        createdAt: Date.now()
      };

      // Отправляем сообщение всем в комнате
      io.to(`ticket_${ticketId}`).emit('support:newMessage', message);
      console.log(`💬 Сообщение в тикете ${ticketId} от ${userName}: ${text}`);
    });

    socket.on('disconnect', () => {
      console.log('🔌 Пользователь отключился:', socket.id);
    });
  });

  return io;
}

module.exports = { initSocket, getIO: () => io };