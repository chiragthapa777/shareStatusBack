const express = require("express");
const router = express.Router();
const { errorRes, successRes } = require("../../utils/response");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const authorize = require("../../middleware/authorize");

//get all user and serach user
router.get("/", authorize, async (req, res) => {
  try {
    let whereObj = {};
    const { search } = req.query;
    if (search) {
      whereObj.OR = [
        {
          name: {
            contains: search,
          },
        },
        { email: { contains: search } },
      ];
    }
    let user = await prisma.user.findMany({
      take: 10,
      where: whereObj,
      select: {
        id:true,
        name: true,
        email: true,
        bio: true,
        image: true,
        following: {
          include: {
            following: true,
          },
        },
        follower: {
          include: {
            user: true,
          },
        }
      },
      orderBy: {
        name: "asc",
      },
    });
    successRes(res, user);
  } catch (error) {
    errorRes(res, error);
    console.log("create user error:", error);
  }
});

//get user by id
router.get("/:id", authorize, async (req, res) => {
  try {
    let { id } = req.params;
    console.log(id);
    let user = await prisma.user.findUnique({
      where: {
        id: Number(id),
      },
      select: {
        id:true,
        name: true,
        email: true,
        bio: true,
        image: true,
        following: {
          include: {
            following: true,
          },
        },
        follower: {
          include: {
            user: true,
          },
        }
      },
    });
    console.log(user);
    if (!user) {
      throw "Cannot find user";
    }
    successRes(res, user);
  } catch (error) {
    errorRes(res, error);
    console.log("create user error:", error);
  }
});

module.exports = router;
