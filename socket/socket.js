const socketIO = require("socket.io");

exports.sio = (server) => {
  return socketIO(server, {
    cors: {
    //   origin: "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
      transports: ["websocket", "polling"],
    },
    allowEIO3: true,
  });
};

exports.connection = (io) => {
  io.on("connection", (socket) => {
    console.log("A user is connected");

    socket.on('join-room', function (room) {
        socket.join(room);
        console.log(`A user join room: ${room}`)
    });

    socket.on("send-message",(message, room)=>{
        console.log(room,message)
        socket.broadcast.to(room).emit("receive-message",message)
    })

    socket.on("disconnect", () => {
      console.log(`socket ${socket.id} disconnected`);
    });

  });
};
