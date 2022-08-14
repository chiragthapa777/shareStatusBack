const express = require("express");
const router = express.Router();
const { errorRes, successRes } = require("../../../../utils/response");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const authorize = require("../../../../middleware/authorize");
const addNotication = require("../../../../utils/addNotification");


router.post("/", authorize, async(req,res)=>{
    try {
        const{postId, likerId}=req.body
        let text=""
        if(!postId || !likerId){
            throw "cannot like the post"
        }
        const user=await prisma.user.findUnique({
            where:{
                id:Number(likerId)
            }
        })
        if(!user){
            throw "Cannot find the user"
        }
        const post= await prisma.post.findUnique({
            where:{
                id:Number(postId)
            },
            include:{
                likes:true
            }
        })
        if(!post){
            throw "cannot find the post"
        }
        let result=null
        if(post.likes.find(like=>like.likedBy===user.id)){
            result=await prisma.like.deleteMany({
                where:{
                    AND:{
                        postId:post.id,
                        likedBy:user.id
                    }
                }
            })
            text="successfully unliked the post"
            await addNotication(req, prisma, post.userId,`Like: ${req.user.name} unliked your post `, "like", postId)
        }else{
            result=await prisma.like.create({
                data:{
                    likedBy:user.id,
                    postId:post.id
                },
                include:{
                    user:true
                }
            })
            text="successfully liked the post"
            await addNotication(req, prisma, post.userId,`Like: ${req.user.name} liked your post `, "like", postId)
        }
        successRes(res,result)
    } catch (error) {
        console.log(error)
        errorRes(res,error)
    }
})

module.exports=router