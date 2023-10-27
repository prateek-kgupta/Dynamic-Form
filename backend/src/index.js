const express = require("express");
const cors = require("cors");
const http = require("http");
const socketio = require("socket.io");
const Chat = require("./models/chat");

require("./db/mongoose");

const app = express();
const server = http.createServer(app);

app.use(express.json());
const corsOptions = {
  origin: "*",
};
app.use(cors(corsOptions));

const loginRoutes = require("../src/router/loginRoutes");
const formRoutes = require("../src/router/formRoutes");
const responseRoutes = require("../src/router/responseRoutes");
const User = require("./models/users");
const { default: mongoose } = require("mongoose");

app.use("/user", loginRoutes);
app.use("/form", formRoutes);
app.use("/response", responseRoutes);

// SOCKET
const io = socketio(server, { cors: corsOptions });

// const usersInRooms = new Map()

io.on("connection", (socket) => {
  console.log("New websocket connection....");

  //   JOIN ROOM
  socket.on("join", async ({ roomId, userId }) => {
    // UPDATE SUBSCRIBER
    // const result = await Chat.findOneAndUpdate(
    //   { roomId: roomId },
    //   {
    //     $addToSet: { subscribedUsers: { $each: [userId] } },
    //     $set: { roomId },
    //   },
    //   { upsert: true, new: true }
    // );
    socket.join(roomId);
    // if (!usersInRooms.has(roomId)) {
    //   usersInRooms.set(roomId, new Set());
    // }
    const allChats = await Chat.find({ roomId });
    socket.emit("allMessages", { allChats });
  });

  //   NEW MESSAGE
  socket.on("newMessage", async ({ roomId, message, from, name }) => {
    console.log("Getting new message");
    const result = await Chat.findOneAndUpdate(
      { roomId },
      {
        $addToSet: { chat: { from, name, message } },
        $set: { roomId },
      },
      { upsert: true, new: true }
    );

    // console.log(result);
    const subscribedUsers = result.subscribedUsers;
    socket.to(roomId).emit("newMessage", { roomId, message, from, name });
    socket.to(`${roomId}_notify`).emit("notifications", { roomId });

    // STORE NOTIFICATION IN THE DATABASE OF EVERY SUBSCRIBED USER
    for (let user of result.subscribedUsers) {
      console.log(user);
      if (user.toString !== from) {
        const setNotification = await User.findOneAndUpdate(
          { _id: user },
          {
            $addToSet: { notifications: roomId },
          }
        );
      }
    }
  });

  socket.on("getMessages", async ({ userId }) => {
    const allChats = await Chat.find({ subscribedUsers: userId });
    socket.emit("allMessages", { allChats });
  });

  socket.on("getSubForms", async ({ userId }) => {
    console.log("Getting subscribed forms");
    const result = await Chat.find({ subscribedUsers: userId }).select({
      roomId: 1,
      _id: 0,
    });
    console.log(result);

    socket.emit("subForms", { result });
    for (let room of result) {
      socket.join(`${room.roomId}_notify`);
    }
  });

  socket.on("subscribe", async ({ roomId, userId }) => {
    socket.join(`${roomId}_notify`)
    const result = await Chat.findOneAndUpdate(
      { roomId },
      {
        $addToSet: { subscribedUsers: { $each: [userId] } },
      },
      { new: true }
    );
    console.log(userId, "\n\n", result);
  });

  socket.on("unsubscribe", async ({ roomId, userId }) => {
    userId = new mongoose.Types.ObjectId(userId)
    socket.leave(`${roomId}_notify`)
    const result = await Chat.findOneAndUpdate(
      { roomId },
      {
        $pull: { subscribedUsers: userId },
      },
      { new: true }
    );
    console.log(userId, "\n\n", result);
  });

  // Get all available notifications of a user
  socket.on('getNotifications', async ({userId}) => {
    console.log("Getting all notifications")
    const result = await User.findOne({_id: userId}).select({'notifications':1, '_id': 0})
    console.log(result)
    socket.emit('dbNotifications', {result})
  })
});

const port = process.env.PORT || 3000;

server.listen(port, () => console.log("Server is listening at port", port));
