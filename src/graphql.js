const { graphqlHTTP } = require('express-graphql')
const {
  GraphQLSchema,
  GraphQLObjectType
} = require('graphql')

//https://github.com/WebDevSimplified/Learn-GraphQL/blob/master/server.js

const RootQueryType = new GraphQLObjectType({
  name: 'Query',
  description: 'Root Query',
  fields: () => {
    let fields = {}

    //REGISTER ALL QUERIES HERE:
    require("./api/user").registerQueries(fields)
    require("./api/message").registerQueries(fields)

    return fields;
  }
})

const RootMutationType = new GraphQLObjectType({
  name: 'Mutation',
  description: 'Root Mutation',
  fields: () => {
    let fields = {}

    //REGISTER ALL MUTATIONS HERE:
    require("./api/user").registerMutations(fields)
    require("./api/message").registerMutations(fields)

    return fields;
  }
})

const schema = new GraphQLSchema({
  query: RootQueryType,
  mutation: RootMutationType
})

module.exports = (app) => {
    app.use("/graphql", (req, res, next) => {
      gql = graphqlHTTP({
        schema: schema,
        graphiql: true,
        context: {user: res.locals.user}
      })
      return gql(req, res, next)
    })
};
