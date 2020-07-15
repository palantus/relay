const Message = require("../model/message")
const EventEmitter = require('events');

class Emitter extends EventEmitter {}
emitter = new Emitter

module.exports = {
    create: (msg) => {
        let message = new Message(msg).toObj();
        emitter.emit("create", message)
        return message;
    },
    findByUser: (user, args) => {
        return Message.findByUser(user, args).map(m => m.toObj())
    },
    messageEvents: emitter
}