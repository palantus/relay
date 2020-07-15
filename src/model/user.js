"use strict"

let Entity = require("entitystorage")

class User extends Entity{
    initNew({id, key, name = "", endpoint = null} = {}){
        if(!id)
            throw "Id not provided for new user"
        if(User.lookup(id))
            throw "User already exists"

        this.id = id
        this.name = typeof name === "string" && name.length > 0 ? name : ""
        this.endpoint = endpoint
        this.key = key
        this.tag("user")
    }

    static lookup(id){
        return User.find(`tag:user prop:"id=${id}"`)
    }

    static all(){
        return User.search("tag:user")
    }

    toObj(){
        return {
            id: this.id,
            name: this.name,
            active: !this.tags.includes("deactivated"),
            endpoint: this.endpoint,
            key: this.key
        }
    }
}

module.exports = User