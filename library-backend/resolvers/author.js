const { GraphQLError } = require('graphql')

const Author = require('../models/author')

const resolvers = {
  Query: {
    authorCount: () => Author.collection.countDocuments(),
    allAuthors : async () => Author.find({}).populate('books'),
  },
  Author: {
    bookCount: async (root) => root.books.length 
  },
  Mutation: {
    editAuthor: async (root, args, context) => {
      //throw if published year not 4 digits
      if(args.setBornTo < 1000 || args.setBornTo > 9999){
        throw new GraphQLError('invalid published year format' , {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.setBornTo,
          }
        })
      }

      const findAuthor = await Author.findOne({ name: args.name })
      const currentUser = context.currentUser

      if(!currentUser){
        throw new GraphQLError('not authenticated', {
          extensions: {
            code: 'BAD_USER_INPUT'
          }
        })
      }

      // throw if author doesn't exist
      if(!findAuthor){
        throw new GraphQLError('Author not found' , {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.name,
          }
        })
      }

      // make changes to author
      findAuthor.born = args.setBornTo 
      try{
        await findAuthor.save()
      }
      catch(error){
        throw new GraphQLError('Edit author failed' , {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.name,
            error
          }
        })
      }
      return findAuthor
    },
  }
}

module.exports = resolvers