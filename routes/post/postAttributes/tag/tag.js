const express = require("express");
const router = express.Router();
const { errorRes, successRes } = require("../../../../utils/response");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const authorize = require("../../../../middleware/authorize");


router.get("/", authorize, async(req,res)=>{
    try {
        const tags = await prisma.tag.findMany()
        successRes(res,tags)
    } catch (error) {
        console.log(error)
        errorRes(res,error)
    }
})

module.exports=router