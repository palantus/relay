import relay from "./client.mjs"

class SampleClient{
    async init(){
        relay.addEventListener('disconnected', () => $("#status").text("Disconnected"))
        relay.addEventListener('connected', () => $("#status").text("Connected - not logged in"))
        relay.addEventListener('message', ({detail: msg}) => {this.addMessage(msg)})
        relay.addEventListener('error', ({detail: errorText}) => alert(errorText))
        $(() => {
            $("#send").click(() => {
                relay.send({channel: "chat", content: {text: $("#newmessage").val()}, participants: [$("#receiver").val()]})
            })
            $("#login").click(() => {
                this.login()
            })
        })
    }

    async login(){
        let user = await relay.login({id: $('#userid').val(), key: $('#key').val()})

        $("#status").text("Logged in as " + user.id)
        $("#log").empty();

        let chatLog = (await (await fetch(`/graphql?query=
            {
                user(id: "${user.id}", key: "${user.key}") {
                    id
                    messages(last: 8, channel: "chat", includeMine: true) {
                        id
                        userId
                        channel
                        content
                    }
                }
            }`)).json()).data.user.messages

        chatLog.forEach(m => this.addMessage(m))
    }

    async addMessage(message){
        $("#log").prepend($(`<div>${message.userId == $('#userid').val() ? "Me" : message.userId}: ${JSON.parse(message.content).text}</div>`))
    }
}

$(() => {
    new SampleClient().init()
})

export default SampleClient;