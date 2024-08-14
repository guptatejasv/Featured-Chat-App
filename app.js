const env = require("dotenv");
const express = require("express");
env.config();
const UserRoute = require("./routes/userRoute");
const app = express();
const http = require("http");
const server = http.createServer(app);

const User = require("./models/userModel");
const Chat = require("./models/chatModel");
const { Server } = require("socket.io");
const io = new Server(server);

var usp = io.of("/user-namespace");

usp.on("connection", async function (socket) {
  console.log("User connected");

  var userId = socket.handshake.auth.token;
  await User.findByIdAndUpdate({ _id: userId }, { $set: { is_online: "1" } });
  socket.broadcast.emit("getOnlineUser", { user_id: userId });

  socket.on("disconnect", async function () {
    console.log("user Disconnected");
    var userId = socket.handshake.auth.token;
    await User.findByIdAndUpdate({ _id: userId }, { $set: { is_online: "0" } });
    socket.broadcast.emit("getOfflineUser", { user_id: userId });
  });
  socket.on("newChat", function (data) {
    socket.broadcast.emit("loadNewChat", data);
  });
  socket.on("existChat", async function (data) {
    var chats = await Chat.find({
      $or: [
        {
          sender_id: data.sender_id,
          receiver_id: data.receiver_id,
        },
        {
          sender_id: data.receiver_id,
          receiver_id: data.sender_id,
        },
      ],
    });
    socket.emit("loadChats", { chats: chats });
  });
});

const mongoose = require("mongoose");
mongoose
  .connect(
    "mongodb+srv://guptatejasv86086:IHiNa09sVQaCgM9N@cluster0.6etxq2u.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
  )
  .then(() => {
    console.log("Connected to the database.");
  });
app.use("/", UserRoute);
server.listen(process.env.PORT, () => {
  console.log(`Server is connected at port ${process.env.PORT}`);
});
