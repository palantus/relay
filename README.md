# Message Relay Service

A service for relaying messages between different servers and clients. 

## Features

- Users with optional keys/passwords.
- User endpoints (new messages for that user will be POST'ed to that endpoint)
- GraphQL based API with good filtering
- Self-contained permanent storage of messages (stored in ./data folder using entitystorage)
- Websocket clients. Can be used to send messages around in real-time!
- Sample chat app included. Open root url to check it out.

## Permission model

Store an admin key in .env as ADMINKEY=myadminkey. It is used for admin operations like creating users.

For every other request, you need to provide an user id and key. If you did not set a key for a user, it won't require it.

## API

View documentation and use API from /graphql when the service is started.

Create user

```graphql
mutation {
  userAdd(input:{id:"me", name: "My name", key:"letmein", adminKey: "myadminkey"}){
    id, name, active
  }
}
```

New message:

```graphql
mutation {
  messageAdd(input: {user: {id: "me", key: "letmein"}, channel: "chat", participants: ["otheruser"], content: "Hello!!!"}) {
    id
    content
  }
}
```

Get last 5 messages in channel "chat":

```graphql
{
  user(id: "me", key: "letmein") {
    id
    name
    key
    messages(last: 5, includeMine:true, channel: "chat") {
      id
      userId
      channel
      content
      isRead
      participants,
      timestamp
    }
  }
}
```

## Browser clients

Include /browser.js in your browser apps and check out index.html in www folder for a sample implementation.

## Websocket

The browser client uses websocket to communicate. If you want to create your own client, you need to send a login message first (as string):

```json
{
  "type": "login",
  "id": "me",
  "key": "optionalkey"
}
```

Afterwards you will receive messages in the format:

```json
{
  "type": "status",
  "content": {
    "status": "loggedin",
    "user": {
      "id": "me",
      "name": "Anders",
      "active": true,
      "endpoint": {
        "url": "http://localhost:8080/echo"
      }
    }
  }
}

{
  "type": "message",
  "content": {
    "id": 75,
    "userId": "me",
    "channel": "chat",
    "participants": [
      "otheruser"
    ],
    "content": "Hello",
    "timestamp": "2020-07-15T12:36:18.683Z",
    "isRead": false
  }
}
```

You can send messages by sending:

```json
{
  "type": "message",
  "content": {
    "channel": "chat",
    "content": "Hi again",
    "participants": [
      "otheruser"
    ]
  }
}
```

Errors are sent back in the format:

```json
{
  "type": "error",
  "content": "You are not logged in"
}
```

## Configuration

Create a .env file in root directory and enter:

```
ADMINKEY=adminkey
ENABLEDBBROWSER=false
```

Note: Please update adminkey to something else!

- ADMINKEY: used for all admin operations, like creating users
- ENABLEDBBROWSER: Is a database UI used to query data. It is usually only necessary in debug scenarios. When enabled, the UI can be accessed using /db