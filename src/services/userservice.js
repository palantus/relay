const User = require("../model/user")
const {messageEvents} = require("./messageservice")
const axios = require('axios')
const jwt = require('jsonwebtoken')
require('dotenv').config()
const { v4: uuidv4 } = require('uuid');

function checkAccess({id, key, adminKey} = {}, requireAdmin){
    if(requireAdmin){
        if(adminKey != process.env.ADMINKEY){
            throw "Wrong admin key for operation"
        }
    } else if(key && key.length > 100){
        jwt.verify(key, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
          if (err) throw `JWT decode error: ${err}`;
          
          let id = payload.sub || payload.id || payload.userId || payload.user?.id || payload.user?.userId;
          let name = payload.name || payload.user?.name;

          if(id && !User.lookup(id)){
            new User({id, name, key: uuidv4()})
          }
          if(!id)
            throw "Invalid token for user creation. User id is not present in payload."
        })
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