const express = require("express");
const router = express.Router();
const { errorRes, successRes } = require("../../utils/response");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const authorize = require("../../middleware/authorize");
const addNotication = require("../../utils/addNotification");

//get user with their latest chat with the user
router.get("/userlists", authorize, async (req, res) => {
  try {
    let users = [];
    users = await prisma.user.findMany({
      where: {
        id: {
          not: req.user.id,
        },
      },
      include: {
        sender: {
          take: 1,
          where: {
            receiverId: req.user.id,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        image: true,
      },
    });
    let sortedUser =
      users.sort(
        (a, b) =>
          (b.sender.length > 0
            ? b.sender[0]?.createdAt
              ? new Date(b.sender[0].createdAt)
              : new Date(1382086394000)
            : new Date(1382086394000))
            -
            (a.sender.length > 0
                ? a.sender[0]?.createdAt
                  ? new Date(a.sender[0].createdAt)
                  : new Date(1382086394000)
                : new Date(1382086394000))
      ) 
      successRes(res, sortedUser);
  } catch (error) {
    errorRes(res, error);
    console.log("get chat error:", error);
  }
});

//follow
router.get("/:id", authorize, async (req, res) => {
  try {
    const receiverId = Number(req.params.id);
    const senderId = req.user.id;
    let chats = await prisma.chat.findMany({
      where: {
        senderId:{
            in:[senderId,receiverId]
        },
        receiverId:{
            in:[senderId,receiverId]
        },
      },
      orderBy: {
        createdAt: "asc",
      },
      include:{
        sender:{
          include:{
            image:true
          }
        },
        receiver:{
          include:{
            image:true
          }
        }
      }
    });
    successRes(res, chats);
  } catch (error) {
    errorRes(res, error);
    console.log("get chat error:", error);
  }
});

router.post("/", authorize, async (req, res) => {
  try {
    const senderId = req.user.id;
    const { message, receiverId } = req.body;
    const chat = await prisma.chat.create({
      data: {
        receiverId,
        senderId,
        chat: message,
      },
      include:{
        sender:{
          include:{
            image:true
          }
        },
        receiver:{
          include:{
            image:true
          }
        }
      }
    });
    successRes(res, chat);
  } catch (error) {
    errorRes(res, error);
    console.log("post chat error:", error);
  }
});

module.exports = router;
