const { io } =require("socket.io-client");

const addNotication = async (req ,prisma, userId, text, type, postId) => {
  try {
    console.log("notiffffffffffffff")
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

      //send notication to client
      const socket=io(process.env.IO_CLIENT_URL)
      const users=JSON.parse(req?.app?.locals?.connectedUsers)?JSON.parse(req.app.locals.connectedUsers):[]
      const user=users.find(u=>u?.userId===notication.userId)
      console.log(notication, user)
      if(user){
        socket.emit("add-notification",notication,user.socketId+"_room")
      }
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

      console.log("check")
      switch (type) {
        case "like": {
          if (user.setting.likeNotication && userId!==req.user.id) {
              return await populate(userId,text,null,null,Number(postId))
          }
      }
      case "comment": {
          if (user.setting.commentNotication && userId!==req.user.id) {
              return await populate(userId,text,null,null,Number(postId))
          }
      }
      case "share": {
          if (user.setting.shareNotication && userId!==req.user.id) {
              return await populate(userId,text,null,null,Number(postId))
          }
      }
      case "follow": {
          if (user.setting.followNotication && userId!==req.user.id) {
              return await populate(userId,text,Number(req?.user.id),null,null)
          }
        }
      case "schedule": {
              return await populate(userId,text,null,null,Number(postId))
        }
      }
    
  } catch (error) {
    console.log(error)
  }
};

module.exports = addNotication;

//comment, like, share: post owner ko notication bannu parxa
//follow: follow vako id ko ma bannu parxa
