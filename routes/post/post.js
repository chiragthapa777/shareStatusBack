const express = require("express");
const router = express.Router();
const { errorRes, successRes } = require("../../utils/response");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const authorize = require("../../middleware/authorize");


const populateTag=async(tags, postId)=>{
 try {
   if(tags){
     const tagArr=tags.split(",");
     const tagPost=[]
     for (const tagName of tagArr) {
       let tag=await prisma.tag.findUnique({
         where:{
           tag:tagName
         }
       })
       if(!tag){
         tag=await prisma.tag.create({
           data:{
             tag:tagName
           }
         })
       }
       tagPost.push(tag)
     }
     if(tagPost.length>0){
       for (const tag of tagPost) {
         await prisma.tag_Post.create({
           data:{
             tagId:tag.id,
             postId
           }
         })
       }
     }
   }
 } catch (error) {
    return error
 }
}
const populateImage=async(id, postId)=>{
  try {
    if(id){
      const image=await prisma.postImage.findUnique(id)
      if(!image){
        throw "Invalid Image id"
      }else{
        await prisma.post.update({
          where:{
            id:postId
          },
          data:{
            imageId:id
          }
        })
      }
    }
  } catch (error) {
    throw error
  }
}

//add post
router.post("/", authorize, async (req, res) => {
  try {
    console.log("................................")
    console.log(req.body);
    let { status, imageId, tags } = req.body;
    let data = { status, userId: req.user.id };
    if (status === "") {
      throw "status cannot be empty";
    }
    if (imageId) {
      let postImage = await prisma.postImage.findUnique({
        where: {
          id: Number(imageId),
        },
      });
      if (!postImage) {
        throw "invalid image post";
      }
      data.imageId = imageId;
    }
    let post = await prisma.post.create({
      data,
      include: {
        comments: true,
        shares: true,
        likes: true,
        user: {
          select: {
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });    
    await populateTag(tags,post.id)
    await populateImage(imageId, post.id)
    post= await prisma.post.findUnique(({
      where:{
        id:post.id
      },
      include:{
        image:true,
        comments:true,
        tags:{
          select:{
            tag:true
          }
        },
        shares:true,
        _count:{
          select:{
            likes:true,
            shares:true,
            comments:true
          }
        }
      }
    }))
    successRes(res, post);
  } catch (error) {
    errorRes(res, error);
    console.log("create user error:", error);
  }
});

//get post for logged in user
router.get("/", authorize, async (req, res) => {
  try {
    let { orderBylike, desc, orderByComment, orderByShare,orderDate, tags, includeSharedPost, fromDate, toDate } = req.query;
    // tags by ,
    let tagArr = [];
    if (tags) {
      tagArr = tags.split(",");
    }
    const user = await prisma.user.findFirst({
      where: {
        id: req.user.id,
      },
      select: {
        following: true,
      },
    });
    const followingArr = user.following.map((obj) => obj.followingId);

    //options
    let includeObj = {};
    let orderByObj = {};
    let whereObj = {};

    //include options
    includeObj._count = {
      select: {
        comments: true,
        likes: true,
        shares: true,
      },
    };
    includeObj.tags ={
      select:{
        tag:true
      }
    };
    includeObj.image=true
    //order by
    orderByObj.createdAt='desc'
    //where
    whereObj.OR = [
        {
          userId: req.user.id,
        },
        {
          userId: {
            in: followingArr,
          },
        },
    ];

    let posts = await prisma.post.findMany({
      take:20,
      where: whereObj,
      include: includeObj,
      orderBy: orderByObj,
    });
    successRes(res, posts);
  } catch (error) {
    errorRes(res, error);
    console.log("create user error:", error);
  }
});

//get by id
router.get("/:id", authorize, async (req, res) => {
  try {
    const {id}=req.params
    const post=await prisma.post.findUnique({
      where:{id:Number(id)},
      include:{
        user:{
          include:{
            image:true,
            setting:true
          }
        },
        comments:true,
        shares:true,
        likes:true,
        _count:{
          select: {
            comments: true,
            likes: true,
            shares: true,
          }
        }
      }
    })
    successRes(res, post);
  } catch (error) {
    errorRes(res, error);
    console.log("create user error:", error);
  }
});

//edit by id
router.put("/:id",authorize,async(req,res)=>{
  try {
    const {id}=req.params
    const {status, imageId}=req.body
    let post=await prisma.post.findUnique({
      where:{id:Number(id)}
    })
    if(post.userId!==req.user.id){
      throw "You are not authorized to edit the post"
    }
    const data={}
    if(status && status!==post.status){
      data.status=status
    }
    if(imageId && imageId!==post.imageId){
      let img=await prisma.postImage.findUnique({
        where:{
          id:imageId
        }
      })
      if(!img) throw "cannot find image"
      data.imageId=imageId
    }
    if(data){
      post =await prisma.post.update({
        where:{
          id:Number(id)
        },
        data,
        include:{
          image:true
        }
      })
    }
    successRes(res,post)
  } catch (error) {
    errorRes(res, error);
    console.log("create user error:", error);
  }
})



module.exports = router;
