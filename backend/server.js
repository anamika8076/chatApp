const express = require('express');
const dotenv = require("dotenv");
const cors = require("cors");
const app = express();
const {chats} = require("./data/data.js");
const connectDB = require('./config/db.js');
const {notFound, errorHandler} = require("./middleware/errorMiddleware.js");
const path = require("path");

dotenv.config();
connectDB();

app.use(express.json());
app.use(cors({
  origin: "https://chat-app-zlep.vercel.app",
  credentials: true
}));

app.use("/api/user", require("./routes/userRoutes.js"));
app.use("/api/chat", require("./routes/chatRoutes.js"));
app.use("/api/message", require("./routes/messageRoutes.js"));

app.use(notFound);
app.use(errorHandler);

const server = app.listen(3000, console.log("Server is running on port 3000"));

const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: "https://chat-app-zlep.vercel.app",
    credentials: true
  }
});