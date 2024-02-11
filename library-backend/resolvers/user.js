const { GraphQLError } = require('graphql')

const User = require('../models/user')
const jwt = require('jsonwebtoken')

const resolvers = {
  Query: {
    me: (root, args, context) => {
      return context.currentUser
    }
  },

  Mutation: {
    createUser: async (root, args) => {
      const user = new User ({ username: args.username, favoriteGenre: args.favoriteGenre })
      return user.save()
        .catch(error => {
          throw new GraphQLError('Creating user failed', {
            extensions: {
              code: 'BAD_USER_INPUT',
              invalidArgs: args.username,
              error
            }
          })
        })
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })

      if(!user || args.password !== 'secret'){
        throw new GraphQLError('Wrong credentials', {
          extensions: {
            code: 'BAD_USER_INPUT'
          }
        })
      }
      const userForToken = {
        username: user.username,
        id: user._id
      }
      return { value: jwt.sign(userForToken, process.env.JWT_SECRET) }
    }
  },
}

module.exports = resolvers