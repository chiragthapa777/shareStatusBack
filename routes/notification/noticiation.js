const express = require("express");
const router = express.Router();
const { errorRes, successRes } = require("../../utils/response");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const authorize = require("../../middleware/authorize");


router.get("/", authorize, async (req, res) => {
  try {
    const notications=await prisma.notication.findMany({
      where:{
        userId:req.user.id
      },
        take:20,
        orderBy:{
            createdAt:"desc"
        },
        include:{
          user:{
            include:{
              image:true
            }
          }
        }
    })
    successRes(res, notications);
  } catch (error) {
    errorRes(res, error);
    console.log("create user error:", error);
  }
});

router.post("/", authorize, async (req, res) => {
  try {
    const notications=await prisma.notication.updateMany({
      where:{
        userId:req.user.id
      },
      data:{
        seen:true
      }
    })
    successRes(res, notications);
  } catch (error) {
    errorRes(res, error);
    console.log("create user error:", error);
  }
});

module.exports = router;
