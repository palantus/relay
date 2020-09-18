const User = require("../model/user")
const {findByUser} = require("../services/messageservice")

const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLNonNull,
    GraphQLBoolean,
    GraphQLInt,
    GraphQLInputObjectType
  } = require('graphql');

const UserType = new GraphQLObjectType({
    name: 'User',
    description: 'This represents a user',
    fields: () => ({
      id: { type: GraphQLNonNull(GraphQLString) },
      name: { type: GraphQLNonNull(GraphQLString) },
      endpoint: {type: UserEndpointType},
      key: {type: GraphQLString},
      active: {type: GraphQLNonNull(GraphQLBoolean), resolve: (parent) => !User.lookup(parent.id).tags.includes("deactivated")},
      messages: {
        type: GraphQLList(MessageType),
        description: "Get user messages",
        args: {
          input: { type: MessageSearchArgsType }
        },
        resolve: (parent, args, context) => findByUser(parent, args.input)
      }
    })
  })

const MessageType = new GraphQLObjectType({
    name: 'Message',
    description: 'This represents a message',
    fields: () => ({
      id: { type: GraphQLNonNull(GraphQLInt) },
      user: { type: GraphQLNonNull(UserType), resolve: (parent, args, context) => User.lookup(parent.userId)},
      userId: { type: GraphQLNonNull(GraphQLString)},
      channel: { type: GraphQLNonNull(GraphQLString) },
      participants: {type: GraphQLList(GraphQLString)},
      content: { type: GraphQLNonNull(GraphQLString) },
      isRead: {type: GraphQLNonNull(GraphQLBoolean)},
      timestamp: {type: GraphQLNonNull(GraphQLString)}
    })
  })
  
const UserCredInputType = new GraphQLInputObjectType({
  name: 'UserCredInputType',
  fields: {
    id: { type: GraphQLNonNull(GraphQLString)},
    key: { type: GraphQLString }
  }
});
  
const MessageSearchArgsType = new GraphQLInputObjectType({
  name: 'MessageSearchArgsType',
  fields: {
    channel: { type: GraphQLString },
    last: { type: GraphQLInt },
    first: { type: GraphQLInt},
    start: { type: GraphQLInt},
    end: { type: GraphQLInt},
    after: { type: GraphQLInt},
    before: { type: GraphQLInt},
    markAsRead: {type: GraphQLBoolean},
    isRead: {type: GraphQLBoolean},
    includeMine: {type: GraphQLBoolean},
    userId: {type: GraphQLString},
    participant: {type: GraphQLString},
    participants: {type: GraphQLList(GraphQLString)},
    id: {type: GraphQLInt}
  }
});


const UserEndpointType = new GraphQLObjectType({
  name: 'UserEndpointType',
  description: 'This represents a user endpoint',
  fields: () => ({
    url: { type: GraphQLNonNull(GraphQLString) },
    username: { type: GraphQLString},
    password: { type: GraphQLString },
    cookie: {type: GraphQLString}
  })
})

const UserEndpointInputType = new GraphQLInputObjectType({
name: 'UserEndpointInputType',
fields: {
  url: { type: GraphQLNonNull(GraphQLString) },
  username: { type: GraphQLString},
  password: { type: GraphQLString },
  cookie: {type: GraphQLString}
}
});

module.exports = {UserType, MessageType, UserCredInputType, UserEndpointType, UserEndpointInputType}