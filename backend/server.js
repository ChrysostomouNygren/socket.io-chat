const { Server } = require("socket.io");
const port = 4000;
const fs = require("fs");

// models
const roomsModel = require("./models/rooms.model");
const messagesModel = require("./models/message.model");

const io = new Server({
  cors: {
    origin: "*",
    methods: ["GET", "POST", "DELETE"],
  },
});

// Connected & get all rooms & messages from the right room
io.on("connection", (socket) => {
  socket.on("ready", async (callback) => {
    socket.join("default");
    callback({ status: "ok" });
    const rooms = await roomsModel.getRooms();
    const messages = await messagesModel.getMessagesFromRoom("default");
    socket.emit("get_rooms", rooms);
    socket.emit("get_messages", messages);
  });

  // Enter chat room
  socket.on("join_room", async (data, callback) => {
    const set = new Set(socket.rooms);
    const joinedRooms = Array.from(socket.rooms);
    const currentRoom = joinedRooms[1];

    // Validation, if you're not already in the room, you can join it.
    if (!set.has(data)) {
      const messages = await messagesModel.getMessagesFromRoom(data);
      socket.leave(currentRoom);
      socket.join(data);
      socket.emit("get_messages", messages);
      callback({ status: "ok" });
    } else {
      callback({ status: "failed" });
    }
  });

  // Leave chat room
  socket.on("leave_room", async (data, callback) => {
    const set = new Set(socket.rooms);

    // Validation to make sure you're actully in the room that you want to leave.
    if (set.has(data)) {
      const messages = await messagesModel.getMessagesFromRoom("default");
      socket.leave(data);
      socket.join("default");
      socket.emit("get_messages", messages);
      callback({ status: "ok" });
    } else {
      callback({ status: "you're not in this room" });
    }
  });

  // Create chat room
  socket.on("create_room", async (data, callback) => {
    console.log(data);
    roomsModel.addRoom(data);
    callback({ status: "ok" });
    const rooms = await roomsModel.getRooms();
    socket.emit("get_rooms", rooms);
  });

  // Delete chat room
  socket.on("delete_room", async (id, room, callback) => {
    callback({ status: "ok" });
    roomsModel.deleteRoom(id);
    messagesModel.deleteMessages(room);
    const messages = await messagesModel.getMessagesFromRoom("default");
    const rooms = await roomsModel.getRooms();
    socket.emit("get_rooms", rooms);
    socket.emit("get_messages", messages);
  });

  // New message
  socket.on("post_message", async (data, user, callback) => {
    const joinedRooms = Array.from(socket.rooms);
    let currentRoom = joinedRooms[1];
    const timeStamp = new Date();
    const date =
      timeStamp.getFullYear() +
      "-" +
      (timeStamp.getMonth() + 1) +
      "-" +
      timeStamp.getDate() +
      " " +
      timeStamp.getHours() +
      ":" +
      timeStamp.getMinutes() +
      ":" +
      timeStamp.getSeconds();

    // Validation to make sure you don't send a emty message
    if (data) {
      messagesModel.addMessage(data, currentRoom, user, date);
      callback({ status: "ok" });
      const messages = await messagesModel.getMessagesFromRoom(currentRoom);
      io.to(currentRoom).emit("get_messages", messages);
      
      const add = JSON.stringify({
        date: date,
        user: user,
        message: data,
        room: currentRoom,
      });
      fs.writeFile("messages.txt", add + ', ', { flag: "a+" }, (err) => {
        if (err) throw err;
      });
    } else {
      callback({ status: "empty message" });
    }
  });
});

io.listen(port);
