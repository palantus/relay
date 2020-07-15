const User = require("../model/user")
const Message = require("../model/message")
const {MessageType, UserType, UserEndpointInputType} = require("./types")
const {checkAccess} = require("../services/userservice")

require('dotenv').config()

if(!process.env.ADMINKEY){
  console.log("WARNING: Please enter an admin key in .env file")
}

const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLNonNull,
    GraphQLBoolean,
    GraphQLInputObjectType,
    GraphQLInt
  } = require('graphql')


const UpdateUserInputType = new GraphQLInputObjectType({
  name: 'UpdateUserInputType',
  fields: {
    id: { type: GraphQLNonNull(GraphQLString) },
    name: { type: GraphQLString },
    endpoint: {type: UserEndpointInputType},
    key: {type: GraphQLString},
    adminKey: { type: GraphQLString }
  }
});

const updateUserOperation = {
    type: UserType,
    description: 'Set name of user',
    args: {
      user: { type: GraphQLNonNull(UpdateUserInputType)}
    },
    resolve: (parent, args) => {
      
        checkAccess(args.user)
        let user = User.lookup(args.user.id)
        if(!user)
          throw "Unknown user"
        if(args.user.name)
          user.name = args.user.name;
        if(args.user.endpoint)
          user.endpoint = JSON.parse(JSON.stringify(args.user.endpoint));
        return user.toObj();
    }
  }

const AddNewUserInputType = new GraphQLInputObjectType({
  name: 'AddNewUserInputType',
  fields: {
    id: { type: GraphQLNonNull(GraphQLString) },
    name: { type: GraphQLNonNull(GraphQLString) },
    key: { type: GraphQLString },
    endpoint: {type: UserEndpointInputType},
    adminKey: { type: GraphQLNonNull(GraphQLString) }
  }
});

const addNewUser = {
  type: UserType,
  description: 'Add new User',
  args: {
    input: { type: GraphQLNonNull(AddNewUserInputType) }
  },
  resolve: (parent, args) => {
      checkAccess(args.input, true)
      return new User(args.input);
  }
}

const deleteUser = {
  type: GraphQLBoolean,
  description: 'Delete User',
  args: {
    id: { type: GraphQLNonNull(GraphQLString) },
    adminKey: { type: GraphQLNonNull(GraphQLString) }
  },
  resolve: (parent, args) => {
    checkAccess(args.input, true)
    User.lookup(args.id).delete()
    return true;
  }
}

const deactivateUser = {
  type: UserType,
  description: 'Deactivate User',
  args: {
    id: { type: GraphQLNonNull(GraphQLString) },
    adminKey: { type: GraphQLNonNull(GraphQLString) }
  },
  resolve: (parent, args) => {
    checkAccess(args.input, true)
    return User.lookup(args.id).tag("deactivated").toObj();
  }
}

const activateUser = {
  type: UserType,
  description: 'Activate User',
  args: {
    id: { type: GraphQLNonNull(GraphQLString) },
    adminKey: { type: GraphQLNonNull(GraphQLString) }
  },
  resolve: (parent, args) => {
    checkAccess(args, true)
    return User.lookup(args.id).removeTag("deactivated").toObj();
  }
}

module.exports = {
    UserType,
    registerQueries: (fields) => {
        fields.user = {
            type: UserType,
            args: {
              id: { type: GraphQLNonNull(GraphQLString) },
              key: { type: GraphQLString },
              adminKey: { type: GraphQLString }
            },
            description: "Look up user",
            resolve: (parent, args, context) => {
              checkAccess(args)
              return User.lookup(args.id);
            }
        }
        fields.userList = {
          type: GraphQLList(UserType),
          description: "Get all users",
          args: {
            adminKey: { type: GraphQLNonNull(GraphQLString) }
          },
          resolve: (parent, args, context) => {
            checkAccess(args, true)
            return User.all()
          }
        }
    },
    registerMutations: (fields) => {
        fields.userUpdate = updateUserOperation
        fields.userAdd = addNewUser
        fields.userDelete = deleteUser
        fields.userActivate = activateUser
        fields.userDeactivate = deactivateUser
    } 
}