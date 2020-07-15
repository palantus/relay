const User = require("../model/user")
const {messageEvents} = require("./messageservice")
const axios = require('axios')

function checkAccess({id, key, adminKey} = {}, requireAdmin){
    if(requireAdmin){
        if(adminKey != process.env.ADMINKEY){
            throw "Wrong admin key for operation"
        }
    } else {
        let user = User.lookup(id);
        if(!user)
            throw "Unknown user: " + id
        if(!adminKey && user.key && key != user.key)
            throw "Access denied for user " + user.id
        if(adminKey && user.key && key != user.key && adminKey != process.env.ADMINKEY)
            throw "Access denied for admin"
    }
}

function userInfo(id){
    let user = User.lookup(id).toObj()
    delete user.key;
    return user;
}

messageEvents.on("create", async (msg) => {
    msg.participants.forEach(async p => {
        let user = User.lookup(p)
        if(!user.endpoint)
            return;

        let method = user.endpoint.method == "post" ? "post" : "get";

        let res = await axios({
            url: user.endpoint.url, 
            method: "post",
            data: msg
        })
    })
})

module.exports = {
    checkAccess,
    userInfo
}