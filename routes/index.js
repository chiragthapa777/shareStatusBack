function router(app){
    //authenictaions
    app.use("/api/auth",require("./authentication/auth"))

    //user and user setting
    app.use("/api/user",require("./user/user"))
    app.use("/api/usersetting",require("./user/userSetting"))
    app.use("/api/follow",require("./follow/follow"))

    //post and attributes
    app.use("/api/post",require("./post/post"))
    app.use("/api/post/like",require("./post/postAttributes/like/like"))
    app.use("/api/post/comment",require("./post/postAttributes/comment/comment"))
    app.use("/api/post/share",require("./post/postAttributes/share/share"))
    app.use("/api/tag",require("./post/postAttributes/tag/tag"))


    //Notications
    app.use("/api/notication",require("./notification/noticiation"))

    //upload
    app.use("/api/upload",require("./upload/upload"))

    //chat
    app.use("/api/chat",require("./chats/chats"))
}

exports.router=router
