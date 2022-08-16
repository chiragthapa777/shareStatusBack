const express = require('express')
const app = express()
const cors=require("cors")
const fileUpload = require("express-fileupload");
const {router}=require("./routes/index")
const http=require('http')
const socketUtils=require("./socket/socket")


//socket server
const server = http.createServer(app);
const io = socketUtils.sio(server);
socketUtils.connection(io);

const socketIOMiddleware = (req, res, next) => {
  req.io = io;

  next();
};

app.use("/api/v1/hello", socketIOMiddleware, (req, res) => {
  req.io.emit("message", `Hello, ${req.originalUrl}`);
  res.send("hello world!");
});


//configs
require("dotenv").config()
app.use(express.json())
app.use(cors())
app.use(fileUpload({
  useTempFiles:true
}))

//varibles
const port = process.env.PORT

//routing
router(app)

//server
server.listen(port, () => {
  console.log(`\n. . . . . . . . . . . . . . . . . . . . . . . .\n|_______Welcome to ShareStatus server_________| \n|         Its running on port ${port}            |\n. . . . . . . . . . . . . . . . . . . . . . . .\n`)
})
