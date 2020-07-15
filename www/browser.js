/*
    // Use the following to listen for messages:

    relay.addEventListener('message', ({detail: message}) => {
        console.log(message);
    })
    
    // And status events:

    relay.addEventListener('status', ({detail: status}) => {
        $("#status").text(status)
    })
*/

class Relay extends EventTarget{
    constructor(){
        super();
        this.onMessage = new Event('message');
        this.user = {}
        this.connect()
    }

    async connect(){
        this.socket = new WebSocket("ws://" + location.host);
        this.ready = new Promise(readyResolve => {
            this.socket.addEventListener('open', (event) => {
                readyResolve(this)
                this.dispatchEvent(new CustomEvent('connected'))
            });

            // Listen for messages
            this.socket.addEventListener('message', (event) => {
                
                let msg = JSON.parse(event.data)
                switch(msg.type){
                    case "status":
                        this.statusReceived(msg.content)
                        break;
                    case "message":
                        this.dispatchEvent(new CustomEvent('message', { detail: msg.content }))
                        break;
                    case "error":
                        this.dispatchEvent(new CustomEvent('error', { detail: msg.content }))
                        break;
                    default:
                        console.log('Unknown message from server', event.data);
                }
                
            });
            
            this.socket.addEventListener('close', (event) => {
                console.log("Connection closed. Attempting reconnect...")
                this.dispatchEvent(new CustomEvent('disconnected'))
                this.connect()
            })
        })
    }

    async login(user){
        await this.ready;
        if(typeof user === "string")
            user = {id: user}
        if(!user.id)
            throw "ERROR: no user id provided for relay login"
        this.socket.send(JSON.stringify({type: "login", content: user}))
    }

    async statusReceived({status, user}){
        switch(status){
            case "loggedin":
                Object.assign(this.user, user);
                this.dispatchEvent(new CustomEvent('loggedin', { detail: {user} }))
                break;
        }
    }

    async send({channel, content, participants = []} = {}){
        this.socket.send(JSON.stringify({type: "message", content: {channel, content: typeof content === "string" ? content : JSON.stringify(content), participants}}))
    }
}

let relay = new Relay();