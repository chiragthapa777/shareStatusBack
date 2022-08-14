const express = require("express");
const router = express.Router();
const { errorRes, successRes } = require("../../utils/response");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt=require("bcrypt")
const jwt = require("jsonwebtoken");
const authorize=require("../../middleware/authorize")

//create user
router.post("/register", async (req, res) => {
  try {
    const {name, password, email}=req.body
    console.log(req.body)
    if(!name || !password || !email){
      throw "Invalid request credentials"
    }
    if(name.length<1){
      throw "Name cannot be empty"
    }
    if(password.length<5){
      throw "Password length should be greater or equals to five"
    }
    const check = await prisma.user.findUnique({where:{
      email
    }})
    if(check){
      throw "Email already exists"
    }
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);
    let user = await prisma.user.create({
      data: {
        name,
        password:hashPassword,
        email
      },
      include: {
        image: true,
        following:{
          include:{
            following:true
          }
        },
        follower:{
          include:{
            user:true
          }
        },
        setting:true
      },
    });
    let sett=await prisma.userSetting.create({
      data:{
        userId:user.id
      }
    })
    user.setting=sett
    const token = jwt.sign({ id: user.id }, process.env.SECRET_KEY);
    delete user.password;
    successRes(res,{ user, token })
  } catch (error) {
    console.log("create user error:", error);
    errorRes(res, error);
  }
});

//login user
router.post("/login", async (req, res) => {
  try {
    const {password, email}=req.body
    if(!password || !email){
      throw "Invalid request credentials"
    }
    const user = await prisma.user.findUnique({where:{
      email
    },
    include: {
      image: true,
      following:{
        include:{
          following:true
        }
      },
      follower:{
        include:{
          user:true
        }
      },
      setting:true
    },
  })
    if(!user){
      throw "Invalid login credentials"
    }
    const isValid = await bcrypt.compare(password, user.password)
    if(!isValid){
      throw "Invalid login credentials"
    }
    const token = jwt.sign({ id: user.id }, process.env.SECRET_KEY);
    delete user.password;
    successRes(res,{ user, token })
  } catch (error) {
    console.log("create post error:", error);
    errorRes(res, error);
  }
});

//get logged user
router.get("/",authorize, async (req, res) => {
  try {
    let user = await prisma.user.findUnique({
      where: {
        id:req.user.id,
      },
      include: {
        image: true,
        following:{
          include:{
            following:true
          }
        },
        follower:{
          include:{
            user:true
          }
        },
        setting:true
      },
    });
    delete user.password,
    // setTimeout(()=>{
    // },3000)
    successRes(res,user)
  } catch (error) {
    errorRes(res, error);
    console.log("create user error:", error);
  }
});

//edit user
router.put("/",authorize, async (req, res) => {
  try {
    let user = await prisma.user.update({
      where: {
        id:req.user.id,
      },
      data:{
        ...req.body
      },
      include: {
        image: true,
        following:{
          include:{
            following:true
          }
        },
        follower:{
          include:{
            user:true
          }
        },
        setting:true
      },
    });
    delete user.password,
    // setTimeout(()=>{
    // },3000)
    successRes(res,user)
  } catch (error) {
    errorRes(res, error);
    console.log("create user error:", error);
  }
});

module.exports = router;
