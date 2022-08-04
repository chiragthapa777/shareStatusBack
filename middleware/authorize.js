
const jwt =require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

function authorize(req, res, next)
{
    const token =req.header("token")
    if(!token) return res.status(401).json({success:false,data:"Not authorized !!!"})
    try{
        const secretKey=process.env.SECRET_KEY
        const payload= jwt.verify(token, secretKey);
        prisma.user.findUnique({
            where:{id:Number(payload.id)}
        }).then(user=>{
            req.user = user;
            next()
        }).catch(error=>{
            res.status(400).json({success:false,data:"Invalid Token"})
            
        })
    }catch(error)
    {
        res.status(400).json({success:false,data:"Invalid Token"})
    }

}

module.exports = authorize;