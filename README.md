# Message Relay Service

A service for relaying messages between different servers and clients. 

## Features

- Users with optional keys/passwords.
- User endpoints (new messages for that user will be POST'ed to that endpoint)
- GraphQL based API with good filtering
- Self-contained permanent storage of messages (stored in ./data folder using entitystorage)

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
