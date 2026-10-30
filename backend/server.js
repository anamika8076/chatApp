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
  res.status(200).json({ status: "ok" });
});

app.use("/api/user", require("./routes/userRoutes.js"));
app.use("/api/chat", require("./routes/chatRoutes.js"));
app.use("/api/message", require("./routes/messageRoutes.js"));

app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 3000;
const server = app.listen(port, () => console.log(`Server is running on port ${port}`));
const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: [...allowedOrigins, "http://localhost:5173"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

connectDB();
