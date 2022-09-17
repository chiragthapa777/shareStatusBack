const express = require("express");
const router = express.Router();
const { errorRes, successRes } = require("../../utils/response");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const authorize = require("../../middleware/authorize");

//get all user and serach user
router.get("/", authorize, async (req, res) => {
  try {
    let whereObj = {};
    
    const { search, take, followingId, followerId, ids } = req.query;
    if (search) {
      whereObj.OR = [
        {
          name: {
            contains: search,
            mode: 'insensitive'
          },
        },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    if(ids){
      let idArr=ids.split(',')
      let arr=idArr.map(a=>Number(a))
      whereObj={
        id:{
          in:arr
        }
      }
    }
    
    whereObj.NOT={
      id:req.user.id
    }
    let option={
      where: whereObj,
      include: {
        setting:true,
        image: true,
        following: {
          include: {
            following: true,
          },
        },
        follower: {
          include: {
            user: true,
          },
        }
      },
      orderBy: {
        name: "desc",
      },
    }
    if(take) option.take=Number(take)
    let user = await prisma.user.findMany(option);
    const users=user.map(u=>{
      delete u.password
      return u
    })
    successRes(res, users);
  } catch (error) {
    errorRes(res, error);
    console.log("create user error:", error);
  }
});

//get list of online user
router.get("/online",(req,res)=>{
  try {
    console.log("pugyoooooooooo")
    successRes(res, JSON.parse(req.app.locals.connectedUsers)
    ? JSON.parse(req.app.locals.connectedUsers)
    : [])
  } catch (error) {
    errorRes(res, error);
  }
})

//get user by id
router.get("/:id", authorize, async (req, res) => {
  try {
    let { id } = req.params;
    let user = await prisma.user.findUnique({
      where: {
        id: Number(id),
      },
      include: {
        image: true,
        following: {
          include: {
            following: true,
          },
        },
        follower: {
          include: {
            user: true,
          },
        },
        posts:{
          include:{
            image:true,
            comments:true,
            _count:{
              select: {
                comments: true,
                likes: true,
                shares: true,
              }
            }
          }
        }
      },
    });
    if (!user) {
      throw "Cannot find user";
    }
    successRes(res, user);
  } catch (error) {
    errorRes(res, error);
    console.log("create user error:", error);
  }
});


module.exports = router;
