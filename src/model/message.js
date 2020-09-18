"use strict"

let Entity = require("entitystorage")
const { argsToArgsConfig } = require("graphql/type/definition")
const User = require("./user")
const {cleanup, cleanupChannelSearch} = require("../tools")

class Message extends Entity{
    initNew({user, channel, participants, content} = {}){
        if((typeof user === "object" && !user.id) || !user)
            throw "Must provide a user for new messages"

        if((typeof channel === "object" && !channel.id) || !channel)
            throw "Must provide a channel for new messages"

        let myUserId = cleanup(typeof user === "object" ? user.id : user)

        if(!User.lookup(myUserId))
            throw `User ${myUserId} doesn't exist, so can't be owner for messages`

        this.userId = myUserId
        this.channel = cleanup(typeof channel === "object" ? channel.id : channel, '/')

        participants = (participants && Array.isArray(participants)) ? participants.map(p => typeof p === "object" ? p.id : p) : []
        this.participants = participants.filter(p => User.lookup(p))

        if(!this.participants.includes(myUserId))
          this.participants.push(myUserId)

        this.content = content
        
        this.participants.forEach(p => {
            this.tag(`user-${p}`)
        })

        //this.tag(`user-${this.userId}`)
        this.prop("timestamp", new Date().toISOString())
        this.tag("message")
    }

    static lookup(id){
        return Message.find(`tag:message id:${id}`)
    }

    static findByUser(user, {channel, isRead, markAsRead, first, last, start, end, after, before, includeMine, userId, participant, participants, id} = {}){
        let myUserId = typeof user === "object" ? user.id : user
        let query = "tag:message" 
        
        // Cleanup
        channel = cleanupChannelSearch(channel)
        userId = cleanup(userId)
        participant = cleanup(participant)
        
        if(id)
          query += ` id:${id}`

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

        if(participants && participants.length > 0)
          query += ` (${participants.map(p => `tag:"user-${p}"`).join(" ")})`

        let results = Message.search(query, {first, last, start, end, after, before})

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