const express = require('express')
const WebSocket = require('ws')
const path = require("path")
const http = require("http")
const Entity = require("entitystorage")
const cors = require('cors')
const {messageEvents, findByUser, create: createMessage} = require("./src/services/messageservice")
const {checkAccess, userInfo} = require("./src/services/userservice");
const { WSAEDESTADDRREQ } = require('constants');

require('dotenv').config()

function handleMessage(messageText, ws){
    try{
        let msg = JSON.parse(messageText)

        switch(msg.type){
            case "login":
                let data = msg.content
                try{
                    checkAccess(data)
                    ws.userId = data.id;
                    ws.send(JSON.stringify({type: "status", content: {status: "loggedin", user: userInfo(data.id)}}))
                } catch(err){
                    console.log(err)
                    ws.send(JSON.stringify({type: "error", content: err}))
                }
                break;

            case "logout":
                delete ws.userId;
                ws.send(JSON.stringify({type: "status", content: {status: "loggedout"}}))
                break;
                
            case "message":
                if(!ws.userId){
                    ws.send(JSON.stringify({type: "error", content: "You are not logged in"}))
                    break;
                }
                let message = msg.content
                message.user = ws.userId
                createMessage(message)
                break;
        }
    } catch(err){
        console.log(err)
    }
}

async function init(){
    app = express()
    app.use(cors())
    app.use("/", express.static(path.join(__dirname, "www")))
    app.get("/client.mjs", (req, res) => res.sendfile(__dirname + '/node_modules/relay-client/client.mjs'))

    let {uiPath, uiAPI} = await Entity.init("./data");

    // --- Database User Interface ---
    if(process.env.ENABLEDBBROWSER == "true"){
        console.log("WARNING: Database UI is enabled! Disable for production!")
        app.use("/db", express.static(uiPath))
        app.use("/db/api/:query", uiAPI);
    }

    // --- API ---
    (require("./src/graphql.js"))(app);

    const server = http.createServer(app)
    const wss = new WebSocket.Server({ server, clientTracking: true});
    
    wss.on('connection', (ws) => {
        ws.on('message', (message) => handleMessage(message, ws))
        ws.on('close', () => {})
        ws.on('error', (err) => {console.log(err)})
    });

    const port = process.env.PORT ? parseInt(process.env.PORT) : 8080;
    server.listen(port, () => (console.log(`Service started on port ${port} (http)`)))

    messageEvents.on("create", (message) => {
        wss.clients.forEach(ws => {
            if(ws.userId && (message.userId == ws.userId || message.participants.includes(ws.userId))){
                ws.send(JSON.stringify({type: "message", content: message}))
            }
        })
    })
}

init();
