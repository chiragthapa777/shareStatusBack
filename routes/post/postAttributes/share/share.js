const express = require("express");
const router = express.Router();
const { errorRes, successRes } = require("../../../../utils/response");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const authorize = require("../../../../middleware/authorize");
const addNotication = require("../../../../utils/addNotification");


router.post("/:id", authorize, async(req,res)=>{
    try {
        let text=''
        const {id}=req.params
        const userId=req.user.id
        const post= await prisma.post.findUnique({
            where:{
                id:Number(id)
            },
            include:{
                shares:true
            }
        })
        if(!post){
            throw "cannot find the post"
        }
        let result
        if(post.shares.find(like=>like.sharedBy===Number(userId))){
            result =await prisma.share.deleteMany({
                where:{
                    AND:{
                        postId:post.id,
                        sharedBy:Number(userId)
                    }
                }
            })
            text="successfully unshared the post"
            await addNotication(req, prisma, post.userId,`Share: ${req.user.name} unshared your post `, "share", post.id)
        }else{
            result =await prisma.share.create({
                data:{
                    postId:post.id,
                    sharedBy:Number(userId)
                },
                include:{
                    user:true
                }
            })
            text="successfully shared the post"
            await addNotication(req, prisma, post.userId,`Share: ${req.user.name} shared your post `, "share", post.id)
        }
        successRes(res,result)
    } catch (error) {
        errorRes(res,error)
    }
})

module.exports=router