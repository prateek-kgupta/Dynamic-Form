const Chat = require("../models/chat");
const User = require("../models/users");
const { default: mongoose } = require("mongoose");

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("New websocket connection....");

    //  JOIN CHAT ROOM, LEAVE NOTIFICATION ROOM
    socket.on("join", async ({ roomId, userId }) => {
      socket.join(roomId);
      socket.leave(`${roomId}_notify`);
      const allChats = await Chat.find({ roomId });
      socket.emit("allMessages", { allChats });
    });

    // LEAVE CHAT ROOM, JOIN NOTIFICATION ROOM
    socket.on("leaveChatRoom", ({ roomId, isSubscribed }) => {
      socket.leave(roomId);
      if (isSubscribed) {
        socket.join(`${roomId}_notify`);
      }
    });

    //  NEW MESSAGE
    socket.on("newMessage", async ({ roomId, message, from, name }) => {
      console.log("Getting new message");
      const result = await Chat.findOneAndUpdate(
        { roomId },
        {
          $addToSet: { chat: { from, name, message } },
        }
      );
      const roomName = result.roomName;
      let subscribedUsers = result.subscribedUsers;
      // emit to everyone in chat room
      socket
        .to(roomId)
        .timeout(1000)
        .emit(
          "newMessage",
          { roomId, message, from, name },
          async (err, response) => {
            subscribedUsers = subscribedUsers.filter(
              (user) => !response.includes(user.toString())
            );
            console.log("After filter\n", subscribedUsers);
            // store notification for subscribed users
            for (let user of subscribedUsers) {
              const userId = user.toString();
              console.log(user)
              console.log(userId)
              if (!response.includes(userId) && userId !== from) {
                const setNotification = await User.findOneAndUpdate(
                  { _id: user},
                  {
                    $addToSet: { notifications: { roomId, roomName } },
                  }
                );
                console.log(setNotification)
              }
            }
          }
        );
      socket.to(`${roomId}_notify`).emit("notifications", { roomId, roomName });
    });

    // ALL MESSAGES FROM THE FORM USER HAS SUBSCRIBED
    socket.on("getMessages", async ({ userId }) => {
      const allChats = await Chat.find({ subscribedUsers: userId });
      socket.emit("allMessages", { allChats });
    });

    // SUBSCRIBED FORM OF THE USER
    socket.on("getSubForms", async ({ userId }) => {
      const result = await Chat.find({ subscribedUsers: userId }).select({
        roomId: 1,
        _id: 0,
      });
      socket.emit("subForms", { result });
      for (let room of result) {
        socket.join(`${room.roomId}_notify`);
      }
    });

    // SUBSCRIBE TO A FORM
    socket.on("subscribe", async ({ roomId, userId }) => {
      const result = await Chat.findOneAndUpdate(
        { roomId },
        {
          $addToSet: { subscribedUsers: { $each: [userId] } },
        },
        { new: true }
      );
      console.log(userId, "\n\n", result);
    });

    // UNSUBSCRIBE A FORM
    socket.on("unsubscribe", async ({ roomId, userId }) => {
      userId = new mongoose.Types.ObjectId(userId);
      socket.leave(`${roomId}_notify`);
      const result = await Chat.findOneAndUpdate(
        { roomId },
        {
          $pull: { subscribedUsers: userId },
        },
        { new: true }
      );
      console.log(userId, "\n\n", result);
    });

    // REMOVE USER'S NOTIFICATION FOR ONE FORM
    socket.on("removeNotification", async ({ roomId, userId }) => {
      console.log("Remove notifications : ", roomId, userId)
      const result = await User.findByIdAndUpdate(
        userId,
        {
          $pull: { notifications: { roomId } },
        },
        { new: true }
      );
      console.log(result)
    });

    // CLEAR ALL NOTIFICATIONS OF THE USER
    socket.on('removeAllNotifications', async ({userId}) => {
      await User.findByIdAndUpdate(userId, {$set: {notifications: []}})
    })

    // ALL NOTIFICATIONS OF USER
    socket.on("getNotifications", async ({ userId }) => {
      console.log("Getting all notifications");
      const result = await User.findOne({ _id: userId }).select({
        notifications: 1,
        _id: 0,
      });
      console.log(result);
      socket.emit("dbNotifications", { result });
    });
  });
};
