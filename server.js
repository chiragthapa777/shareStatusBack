const express = require('express')
const app = express()
const cors=require("cors")
const fileUpload = require("express-fileupload");
const {router}=require("./routes/index")

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
app.listen(port, () => {
  console.log(`\n. . . . . . . . . . . . . . . . . . . . . . . .\n|_______Welcome to ShareStatus server_________| \n|         Its running on port ${port}            |\n. . . . . . . . . . . . . . . . . . . . . . . .\n`)
})
