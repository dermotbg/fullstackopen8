const { GraphQLError } = require('graphql')

const Book = require('./models/book')
const Author = require('./models/author')
const User = require('./models/user')

const jwt = require('jsonwebtoken')

const { PubSub } = require('graphql-subscriptions')
const pubsub = new PubSub()

const resolvers = {
  Query: {
    bookCount: () => Book.collection.countDocuments(),
    authorCount: () => Author.collection.countDocuments(),
    allBooks: async (root, args) => {
      // if no args given
      if(!args.author && !args.genre){ 
        return Book.find({}).populate('author')
      }
      // if only genre given
      else if(args.genre){
        if(args.author){
          const author = await Author.findOne({ name: args.author })
          return Book.find({ genres: args.genre, author: author._id }).populate('author')
        } 
        else return await Book.find({ genres: args.genre  }).populate('author')
      }
      // if only author given
      else {
        const author = await Author.findOne({ name: args.author })
        return Book.find({ author: author._id }).populate('author')
      } 
    },
    // SHOULD THIS HAVE NAME ARG?
    allAuthors : async (root, args) => Author.find({}),

    me: (root, args, context) => {
      return context.currentUser
    }
  },
  Mutation: {
    addBook: async (root, args, context) => {
      let bookAuthor = await Author.findOne({ name: args.author })
      if(!bookAuthor){
        bookAuthor = await Author.create({ name: args.author })
      }
      const newBook = new Book({ ...args, author: bookAuthor })
      const currentUser = context.currentUser
      if(!currentUser){
        throw new GraphQLError('not authenticated', {
          extensions: {
            code: 'BAD_USER_INPUT',
          }
        })
      }
      try{
        await newBook.save()
      }
      catch(error){
        throw new GraphQLError('Add book failed' , {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.title,
            error
          }
        })
      }
      pubsub.publish('BOOK_ADDED', { bookAdded: newBook })
      return newBook
    },

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
  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterator('BOOK_ADDED')
    }
  }
}

module.exports = resolvers