const addNotication=require("./addNotification")
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const schedule = require("node-schedule");

const cronPost=async (postId, date)=>{
    try {
        const updateActive=async (postId)=>{
            console.log("aayoo")
            const post=await prisma.post.update({
                where:{
                    id:postId
                },
                data:{
                    active:true,
                    createdAt:new Date()
                },
                include:{
                    user:true
                }
            })
            if(post){
                await prisma.scheduleUploadList.delete({
                    where:{
                        postId
                    }
                })
            }
            await addNotication(null, prisma, post.user.id,`Post shedule: Your post has been uploaded `, "shedule", post.id)
        }
        if(new Date(date)<=new Date()){
            return updateActive(postId)
        }else{
            schedule.scheduleJob(new Date(date), function () {
                console.log("uploading schedule post :",postId, date)
                return updateActive(postId)
            });
        }
    } catch (error) {
        throw error
    }
}

module.exports={
    async postJob( postId, date){
        try {
            //backup
            await prisma.scheduleUploadList.create({
                data:{
                    postId,
                    date:new Date(date)
                }
            })
            
            cronPost( postId, date)
        } catch (error) {
            console.log("schedule post job error: ",error.message)
        }
    },
    async bulkBackupScheduler(){
        try {
            const list=await prisma.scheduleUploadList.findMany()
            list.map(l=>{
                cronPost(l.postId,l.date)
            })
        } catch (error) {
            console.log(error)
        }
    }
}