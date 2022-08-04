const router = require("express").Router();
const cloudinary = require("cloudinary");
const { errorRes, successRes } = require("../../utils/response");
require("dotenv").config();
const fs = require("fs");
const authorize = require("../../middleware/authorize");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// cloudinary connection
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

const removeTmp = (path) => {
  fs.unlink(path, (err) => {
    if (err) throw err;
  });
};

async function upload(req) {
  try {
    //checking if file exist
    console.log("file is uploading");
    if (!req.files || Object.keys(req.files).length === 0) {
      throw "No files where uploaded";
    }
    const file = req.files.file; //file is the name of key files
    //less than 5 mb
    if (file.size > 1025 * 1025 * 50) {
      removeTmp(file.tempFilePath);
      throw "size is large";
    }
    //file type
    if (file.mimetype !== "image/jpeg" && file.mimetype !== "image/png") {
      removeTmp(file.tempFilePath);
      throw "file type/format not acceptable";
    }
    //Uploading to cloudinary
    const result = await cloudinary.v2.uploader.upload(file.tempFilePath,{folder:"share-statusv2"});
    return result;
  } catch (error) {
    throw error;
  }
}

router.post("/userimage", authorize, async (req, res) => {
  try {
    let maal = await upload(req);
    console.log("uploaded", maal, typeof maal);
    let userImaage= await prisma.userImage.create({
        data:{
            url:maal.secure_url,
            public_url:maal.public_id
        }
    })
    successRes(res, userImaage);
  } catch (error) {
    console.log("userimage upload error:", error);
    errorRes(res, error);
  }
});
router.post("/postImage", authorize, async (req, res) => {
  try {
    let maal = await upload(req);
    let postImage = await prisma.postImage.create({
      data: {
        url: maal.url,
        public_url: maal.public_id,
      },
    });
    successRes(res, postImage);
  } catch (error) {
    console.log("postimage upload error:", error);
    errorRes(res, error);
  }
});

// //deleting
// router.post('/destroy',authorize,(req, res)=>{
//     try {
//         console.log(req.body)
//         const {public_id}=req.body
//         if(!public_id) return res.status(400).json({msg:"no image selected"})
//         cloudinary.v2.uploader.destroy(public_id,async(err, result)=>{
//             if(err) throw err;
//             res.status(200).json({msg:"Deleted Image"})
//         })
//     } catch (error) {
//         res.status(500).json({error:error.message})
//     }

// })

module.exports = router;
