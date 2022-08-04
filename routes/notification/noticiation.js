const express = require("express");
const router = express.Router();
const { errorRes, successRes } = require("../../utils/response");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const authorize = require("../../middleware/authorize");


router.get("/", authorize, async (req, res) => {
  try {
    const notications=await prisma.notication.findMany({
        take:20,
        orderBy:{
            createdAt:"desc"
        }
    })
    successRes(res, notications);
  } catch (error) {
    errorRes(res, error);
    console.log("create user error:", error);
  }
});

module.exports = router;
