"use strict"

let Entity = require("entitystorage")
const { argsToArgsConfig } = require("graphql/type/definition")
const User = require("./user")

class Message extends Entity{
    initNew({user, channel, participants, content} = {}){
        if((typeof user === "object" && !user.id) || !user)
            throw "Must provide a user for new messages"

        if((typeof channel === "object" && !channel.id) || !channel)
            throw "Must provide a channel for new messages"

        this.userId = typeof user === "object" ? user.id : user
        this.channel = typeof channel === "object" ? channel.id : channel

        participants = (participants && Array.isArray(participants)) ? participants.map(p => typeof p === "object" ? p.id : p) : []
        this.participants = participants.filter(p => User.lookup(p))

        this.content = content
        
        this.participants.forEach(p => {
            this.tag(`user-${p}`)
        })

        //this.tag(`user-${this.userId}`)
        this.prop("timestamp", new Date().toISOString())
        this.tag("message")
    }

    static lookup(id){
        return Message.find(`tag:message prop:"id=${id}"`)
    }

    static findByUser(user, {channel, last, isRead, markAsRead, after, includeMine, userId, participant} = {}){
        let myUserId = typeof user === "object" ? user.id : user
        let query = "tag:message" 
        
        
        if(includeMine)
            query += ` (tag:user-${myUserId}|prop:"userId=${myUserId}")`
        else
            query += ` tag:user-${myUserId}`

        if(channel)
            query += ` prop:"channel=${channel}"`

        if(isRead === true)
            query += " tag:read"
        else if(isRead === false)
            query += " !tag:read"

        if(userId)
            query += ` prop:"userId=${userId}"`

        if(participant)
            query += ` tag:"user-${participant}"`

        let results = Message.search(query, {last, after})

        if(markAsRead === true)
            results.tag("read")

        return results;
    }

    toObj(){
        return {
            id: this._id,
            userId: this.userId,
            channel: this.channel || this.channelName,
            participants: this.participants,
            content: this.content,
            timestamp: this.timestamp,
            isRead: this.tags.includes("read")
        }
    }
}

module.exports = Message