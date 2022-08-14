const express = require("express");
const router = express.Router();
const { errorRes, successRes } = require("../../utils/response");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const authorize = require("../../middleware/authorize");
const addNotication=require("../../utils/addNotification")

//follow
router.post("/", authorize, async (req, res) => {
  try {
    let { id } = req.body;
    let toFollowUser = await prisma.user.findUnique({
      where: {
        id,
      },
    });
    if (!toFollowUser) {
      throw "invalid user id";
    }
    let followingArr = await prisma.follow.findMany({
      where: {
        userId: req.user.id,
      }
    });
    console.log(followingArr);
    //check is already follows and want to unfollow
    let unfollowFlag = false;
    for (const follow of followingArr) {
      if (follow.followingId === Number(id)) {
        unfollowFlag = true;
        break;
      }
    }
    let result
    if (unfollowFlag) {
      result=await prisma.follow.deleteMany({
        where: {
          AND: {
            userId: Number(req.user.id),
            followingId: Number(id),
          },
        },
      });
      await addNotication(req,prisma,id,`Follow: ${req.user.name} unfollowed you`, "follow")
    } else {
      result =await prisma.follow.create({
        data: {
          userId: Number(req.user.id),
          followingId: Number(id),
        },
        include:{
          user:true
        }
      });
      await addNotication(req,prisma,id,`Follow: ${req.user.name} started following you`, "follow")
    }
    user = await prisma.follow.findMany({
      where: {
        userId: req.user.id,
      },
      include:{
        following:true
      }
    });
    successRes(res, user);
  } catch (error) {
    errorRes(res, error);
    console.log("create user error:", error);
  }
});

module.exports = router;
