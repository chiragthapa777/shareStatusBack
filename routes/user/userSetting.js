const express = require("express");
const router = express.Router();
const { errorRes, successRes } = require("../../utils/response");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const authorize = require("../../middleware/authorize");

//get all user and serach user
router.get("/", authorize, async (req, res) => {
  try {
    let setting= await prisma.userSetting.findUnique({
        where:{
            userId:req.user.id
        }
    })
    if(!setting){
        setting=await prisma.userSetting.create({
            data:{
                userId:req.user.id
            }
        })
    }
    successRes(res,setting)
} catch (error) {
    errorRes(res, error);
    console.log("create user error:", error);
}
});
router.put("/", authorize, async (req, res) => {
    try {
        let setting= await prisma.userSetting.findUnique({
            where:{
                userId:req.user.id
            }
        })
        if(!setting){
            setting=await prisma.userSetting.create({
                data:{
                    userId:req.user.id
                }
            })
        }
        setting=await prisma.userSetting.update({
            where:{
                userId:req.user.id
            },
            data:req.body
        })
        successRes(res,setting)
  } catch (error) {
    errorRes(res, error);
    console.log("create user error:", error);
  }
});

//get user by id



module.exports = router;
