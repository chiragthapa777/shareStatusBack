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
    const { search } = req.query;
    let users = [];
    let whereObj = {
      id: {
        not: req.user.id,
      },
    };
    if(search){
      whereObj.name={
        contains:search,
        mode: 'insensitive'
      }
    }
    users = await prisma.user.findMany({
      where: whereObj,
      include: {
        image: true,
      }
    });

    let usersWithChat = [];
    for (const u of users) {
      u.sender = await prisma.chat.findMany({
        take: 1,
        where: {
          OR: [
            {
              receiverId: req.user.id,
              senderId: u.id,
            },
            {
              senderId: req.user.id,
              receiverId: u.id,
            },
          ],
        },
        orderBy: {
          createdAt: "desc",
        },
      });
      usersWithChat.push(u);
    }

    let sortedUser = usersWithChat
      .map((u) => {
        if (u.sender.length <= 0) {
          u.sender.push({ createdAt: new Date(-8640000000000000) });
        }
        return u;
      })
      .sort(
        (a, b) =>
          new Date(b.sender[0].createdAt).getTime() -
          new Date(a.sender[0].createdAt).getTime()
      );
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
        senderId: {
          in: [senderId, receiverId],
        },
        receiverId: {
          in: [senderId, receiverId],
        },
      },
      orderBy: {
        createdAt: "asc",
      },
      include: {
        sender: {
          include: {
            image: true,
          },
        },
        receiver: {
          include: {
            image: true,
          },
        },
      },
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
      include: {
        sender: {
          include: {
            image: true,
          },
        },
        receiver: {
          include: {
            image: true,
          },
        },
      },
    });
    successRes(res, chat);
  } catch (error) {
    errorRes(res, error);
    console.log("post chat error:", error);
  }
});

module.exports = router;
