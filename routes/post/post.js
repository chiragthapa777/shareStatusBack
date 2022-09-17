const express = require("express");
const router = express.Router();
const { errorRes, successRes } = require("../../utils/response");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const authorize = require("../../middleware/authorize");
const {postJob} = require("../../utils/schedule");
const moment=require("moment")

const postInclude={
  tags: {
    include:{
      tag:true
    }
  },
  image:true,
  comments: {
    include: {
      user: true,
    },
  },
  shares: {
    include: {
      user: true,
    },
  },
  likes: {
    include: {
      user: true,
    },
  },
  user: {
    select: {
      name: true,
      email: true,
      image: true,
    },
  },
}
const populateTag = async (tags, postId) => {
  try {
    if (tags) {
      const tagArr = tags.split(",");
      const tagPost = [];
      for (const tagName of tagArr) {
        let tag = await prisma.tag.findUnique({
          where: {
            tag: tagName,
          },
        });
        if (!tag) {
          tag = await prisma.tag.create({
            data: {
              tag: tagName,
            },
          });
        }
        tagPost.push(tag);
      }
      if (tagPost.length > 0) {
        for (const tag of tagPost) {
          await prisma.tag_Post.create({
            data: {
              tagId: tag.id,
              postId,
            },
          });
        }
      }
    }
  } catch (error) {
    return error;
  }
};
const populateImage = async (id, postId) => {
  try {
    if (id) {
      const image = await prisma.postImage.findUnique({
        where: {
          id: Number(id),
        },
      });
      if (!image) {
        throw "Invalid Image id";
      } else {
        await prisma.post.update({
          where: {
            id: postId,
          },
          data: {
            imageId: id,
          },
        });
      }
    }
  } catch (error) {
    throw error;
  }
};

//add post
router.post("/", authorize, async (req, res) => {
  try {
    let { status, imageId, tags, schedule, date } = req.body;
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
    if(schedule){
      data.active=false
    }
    let post = await prisma.post.create({
      data,
      include: postInclude,
    });
    await populateTag(tags, post.id);
    await populateImage(imageId, post.id);
    post = await prisma.post.findUnique({
      where: {
        id: post.id,
      },
      include: {
        image: true,
        tags: {
          include: {
            tag: true,
          },
        },
        user: {
          include: {
            image: true,
          },
        },
        comments: {
          include: {
            user: true,
          },
        },
        likes: {
          include: {
            user: true,
          },
        },
        shares: {
          include: {
            user: true,
          },
        },
        _count: {
          select: {
            likes: true,
            shares: true,
            comments: true,
          },
        },
      },
    });
    if(schedule){
      postJob(post.id, date)
      // schedule
      return successRes(res, `Scheduled status will be online ${moment(date).fromNow()}`)
    }
    console.log(post)
    successRes(res, post);
  } catch (error) {
    errorRes(res, error);
    console.log("create user error:", error);
  }
});

//get post for logged in user
router.get("/", authorize, async (req, res) => {
  try {
    let { orderBy, sortBy, from, to, tags, includeSharedPost, userId ,dateRange, search } =
      req.query;
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
    let orderByObj = {};
    let whereObj = {};
    if (tagArr.length > 0) {
      whereObj.tags = {
        some: {
          tag: {
            tag: {
              in: tagArr,
            },
          },
        },
      };
    }
    let includeObj = {
      _count: {
        select: {
          comments: true,
          likes: true,
          shares: true,
        },
      },
      tags: {
        include: {
          tag: true,
        },
      },
      user: {
        include: {
          image: true,
        },
      },
      image: true,
      comments: {
        include: {
          user: {
            include: {
              image: true,
            },
          },
        },
      },
      likes: {
        include: {
          user: {
            include: {
              image: true,
            },
          },
        },
      },
      shares: {
        include: {
          user: {
            include: {
              image: true,
            },
          },
        },
      },
    };

    //include options
    //order by
    orderByObj.createdAt = "desc";
    if (orderBy && (orderBy === "desc" || orderBy === "asc")) {
      orderByObj.createdAt = orderBy;
    }
    if (sortBy) {
      switch (sortBy) {
        case "date":
          break;
        case "like":
          orderByObj = {
            likes: {
              _count: orderBy ? orderBy : "asc",
            },
          };
          break;
        case "share":
          orderByObj = {
            shares: {
              _count: orderBy ? orderBy : "asc",
            },
          };
          break;
        case "comment":
          orderByObj = {
            comments: {
              _count: orderBy ? orderBy : "asc",
            },
          };
          break;
        default:
          break;
      }
    }
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
    console.log(req.query)
    if (dateRange === "true" && from && to) {
      console.log(from, to)
      whereObj.createdAt = {
        lte: new Date(to),
        gte: new Date(from),
      };
    }
    if (userId) {
      //delete all where and then only user
      whereObj = {
        userId: Number(userId),
      };
    }
    if (includeSharedPost === "true" && whereObj?.OR) {
      whereObj.OR.shares = {
        some: {
          user: {
            id: {
              in: followingArr,
            },
          },
        },
      };
    }
    if(search ){
      whereObj={
        status:{
          contains:search,
          mode: 'insensitive'
        }
      }
    }
    whereObj.active=true
    let posts = await prisma.post.findMany({
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

//get by post id
router.get("/:id", authorize, async (req, res) => {
  try {
    const { id } = req.params;
    const post = await prisma.post.findUnique({
      where: { id: Number(id) },
      include: postInclude,
    });
    if(!post || !post.active){
      throw "Cannot find the post"
    }
    successRes(res, post);
  } catch (error) {
    errorRes(res, error);
    console.log("create user error:", error);
  }
});

//edit by id
router.put("/:id", authorize, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, imageId, tags } = req.body;
    let post = await prisma.post.findUnique({
      where: { id: Number(id) },
      include:postInclude
    });
    if(!post || !post.active){
      throw "Cannot find the post"
    }
    if (post.userId !== req.user.id) {
      throw "You are not authorized to edit the post";
    }
    const data = {};
    if (status && status !== post.status) {
      data.status = status;
    }
    if (imageId && imageId !== post.imageId && imageId!=="remove") {
      let img = await prisma.postImage.findUnique({
        where: {
          id: imageId,
        },
      });
      if (!img) throw "cannot find image";
      data.imageId = imageId;
    }
    if(imageId==="remove"){
      data.imageId=null
    }
    if(tags){
      const givenArr=tags.split(',').sort()
      const postTagArr=[]
      post.tags.map(tag=>{
        if(!postTagArr.find(p=>p===tag?.tag)){
          postTagArr.push(tag.tag)
        }
      })
      postTagArr.sort()
      if(givenArr!==postTagArr){
        await prisma.tag_Post.deleteMany({
          where:{
            postId:post.id
          }
        })
        await populateTag(tags,post.id)
      }
    }
    if (data) {
      post = await prisma.post.update({
        where: {
          id: Number(id),
        },
        data,
        include: postInclude,
      });
    }
    successRes(res, post);
  } catch (error) {
    errorRes(res, error);
    console.log("create user error:", error);
  }
});

router.delete("/:id", authorize, async (req, res) => {
  try {
    const { id } = req.params;
    let post = await prisma.post.findUnique({
      where: { id: Number(id) },
      include:postInclude
    });
    if(!post){
      throw "Cannot find the post"
    }
    if (post.userId !== req.user.id) {
      throw "You are not authorized to edit the post";
    }
    post = await prisma.post.update({
      where: {
        id: Number(id),
      },
      data:{
        active:false
      },
      include: postInclude,
    });
    successRes(res, post);
  } catch (error) {
    errorRes(res, error);
    console.log("create user error:", error);
  }
});

module.exports = router;
