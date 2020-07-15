const Message = require("../model/message")
const User = require("../model/user");
const {MessageType, UserType, UserCredInputType} = require("./types")
const messageService = require("../services/messageservice")

const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLNonNull,
    GraphQLBoolean,
    GraphQLInputObjectType,
    GraphQLInt
  } = require('graphql');

//user, channel, participants, message


const AddNewMessageInputType = new GraphQLInputObjectType({
  name: 'AddNewMessageInputType',
  fields: {
    user: { type: GraphQLNonNull(UserCredInputType)},
    channel: { type: GraphQLNonNull(GraphQLString) },
    participants: {type: GraphQLList(GraphQLString)},
    content: { type: GraphQLNonNull(GraphQLString) }
  }
});

const addNewMessage = {
  type: MessageType,
  description: 'Add new Message',
  args: {
    input: { type: GraphQLNonNull(AddNewMessageInputType) }
  },
  resolve: (parent, args) => {
      return messageService.create(args.input);
  }
}

module.exports = {
    MessageType,
    registerQueries: (fields) => {
    },
    registerMutations: (fields) => {
        fields.messageAdd = addNewMessage
    } 
}