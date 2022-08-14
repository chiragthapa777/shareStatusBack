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
          },
        },
        { email: { contains: search } },
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
      take,
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

//get user by id
router.get("/:id", authorize, async (req, res) => {
  try {
    let { id } = req.params;
    console.log(id);
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
    console.log(user);
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
