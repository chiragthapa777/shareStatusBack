const addNotication = async (req ,prisma, userId, text, type, postId) => {
  try {
    const populate = async (userId, text, userLink, chatLink, postLink) => {
      const notication=await prisma.notication.create({
        data: {
          userId: Number(userId),
          notication: text,
          userLink,
          chatLink,
          postLink
        },
      });
      console.log(
        `New notification: ${notication.notication}`
      );
      return notication
    };

    const user = await prisma.user.findUnique({
      where: {
        id: Number(userId),
      },
      include: {
        setting: true,
      },
    });
    if(!user.setting){
        const setting=await prisma.userSetting.create({
            data:{
                userId:Number(userId)
            }
        })
        user.setting=setting
    }

    if(!user) throw "invalid user"
    switch (type) {
      case "like": {
        if (user.setting.likeNotication) {
            return await populate(userId,text,null,null,Number(postId))
        }
    }
    case "comment": {
        if (user.setting.commentNotication) {
            return await populate(userId,text,null,null,Number(postId))
        }
    }
    case "share": {
        if (user.setting.shareNotication) {
            return await populate(userId,text,null,null,Number(postId))
        }
    }
    case "follow": {
        if (user.setting.followNotication) {
            return await populate(userId,text,Number(req.user.id),null,null)
        }
      }
    }
  } catch (error) {
    console.log(error)
  }
};

module.exports = addNotication;

//comment, like, share: post owner ko notication bannu parxa
//follow: follow vako id ko ma bannu parxa
