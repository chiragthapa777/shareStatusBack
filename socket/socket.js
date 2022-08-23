const socketIO = require("socket.io");
const { createClient } = require("redis");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// //redis connection
// const client = createClient({ url: process.env.REDIS_URL });
// client.on("error", (err) => console.log("Redis Client Error", err));
// console.log("Redis server connected");

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

exports.connection = (io, app) => {
  io.on("connection", async (socket) => {
    try {
      socket.on("add-online-user", async (obj, callback) => {
        console.log(obj);
        let user = {};
        if (obj?.userId) {
          user = {
            userId: obj.userId,
            socketId: socket.id,
          };
          let users = JSON.parse(app.locals.connectedUsers)
            ? JSON.parse(app.locals.connectedUsers)
            : [];
          console.log("connectedUsers:", users);
          if (!users?.find((u) => u.userId === obj?.userId)) {
            users.push(user);
            app.locals.connectedUsers = JSON.stringify(users);
            // const user=await prisma.user.findUnique({
            //   where:{
            //     id:(obj?.userId)
            //   },
            //   include:{
            //     setting:true
            //   }
            // })
            // if(user && user?.setting?.focusMode){
            //   setInterval
            // }
          }
          callback(user);
        }
      });

      socket.emit(
        "onlineUsers",
        JSON.parse(app.locals.connectedUsers)
          ? JSON.parse(app.locals.connectedUsers)
          : []
      );

      socket.on("join-room", function (room) {
        socket.join(room);
        console.log(`A user join room: ${room}`);
      });

      socket.on("send-message", (message, room) => {
        socket.broadcast.to(room).emit("receive-message", message);
      });

      socket.on("add-notification", (notification, socketId) => {
        console.log("add-notification :::::::", notification, socketId);
        socket.to(socketId).emit("push-notification", notification);
      });

      socket.on("disconnect", () => {
        console.log(`socket ${socket.id} disconnected`);
        let users = JSON.parse(app.locals.connectedUsers)
          ? JSON.parse(app.locals.connectedUsers)
          : [];
        users = users.filter((u) => u.socketId !== socket.id);
        app.locals.connectedUsers = JSON.stringify(users);
      });
    } catch (error) {
      console.log(error);
    }
  });
};
