const express = require('express');
const dotenv = require("dotenv");
const cors = require("cors");
const app = express();
const {chats} = require("./data/data.js");
const connectDB = require('./config/db.js');
const {notFound, errorHandler} = require("./middleware/errorMiddleware.js");
const path = require("path");

dotenv.config();

app.use(express.json());
const allowedOrigins = (process.env.FRONTEND_URL || "https://chat-app-sand-eight-53.vercel.app")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.get("/health", (_req, res) => {
  const databaseReady = require("mongoose").connection.readyState === 1;
  res.status(databaseReady ? 200 : 503).json({
    status: databaseReady ? "ok" : "degraded",
    database: databaseReady ? "connected" : "disconnected"
  });
});

app.use("/api/user", require("./routes/userRoutes.js"));
app.use("/api/chat", require("./routes/chatRoutes.js"));
app.use("/api/message", require("./routes/messageRoutes.js"));

app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || (process.env.NODE_ENV === "production" ? 10000 : 3000);
const server = app.listen(port, "0.0.0.0", () => console.log(`Server is running on port ${port}`));
const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: [...allowedOrigins, "http://localhost:5173"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

io.on("connection", (socket) => {
  socket.on("setup", (userData) => {
    if (!userData?._id) return;
    socket.join(userData._id.toString());
    socket.emit("connected");
  });

  socket.on("join chat", (chatId) => {
    if (chatId) socket.join(chatId.toString());
  });

  socket.on("typing", (chatId) => {
    if (chatId) socket.to(chatId.toString()).emit("typing", chatId);
  });

  socket.on("stop typing", (chatId) => {
    if (chatId) socket.to(chatId.toString()).emit("stop typing", chatId);
  });

  socket.on("new message", (message) => {
    const users = message?.chat?.users;
    if (!Array.isArray(users)) return;
    users.forEach((chatUser) => {
      const userId = chatUser?._id?.toString() || chatUser?.toString();
      if (userId && userId !== message.sender?._id?.toString()) {
        socket.to(userId).emit("message recieved", message);
      }
    });
  });
});

connectDB();
