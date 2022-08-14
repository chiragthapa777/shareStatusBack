const express = require("express");
const router = express.Router();
const { errorRes, successRes } = require("../../../../utils/response");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const authorize = require("../../../../middleware/authorize");
const addNotication=require("../../../../utils/addNotification")


router.post("/:id", authorize, async(req,res)=>{
    try {
        const{comment}=req.body
        const {id}=req.params
        const userId=req.user.id
        if(!comment || !id){
            throw "cannot comment the post"
        }
        const post= await prisma.post.findUnique({
            where:{
                id:Number(id)
            },
            include:{
                likes:true
            }
        })
        if(!post) throw "cannot find the post"
        const cmt = await prisma.comment.create({
            data:{
                comment,
                postId:Number(id),
                commentedBy:userId
            },
            include:{
                user:{
                    include:{
                        image:true
                    }
                }
            }
        })
        await addNotication(req, prisma, post.userId,`Comment: ${req.user.name} added a comment to your post `, "comment", id)
        successRes(res,cmt)
    } catch (error) {
        console.log(error)
        errorRes(res,error)
    }
})

module.exports=router