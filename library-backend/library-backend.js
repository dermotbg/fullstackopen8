const { ApolloServer } = require('@apollo/server')
const { startStandaloneServer } = require('@apollo/server/standalone')
const { GraphQLError } = require('graphql')
const jwt = require('jsonwebtoken')

const Book = require('./models/book')
const Author = require('./models/author')
const User = require('./models/user')

const mongoose = require('mongoose')
mongoose.set('strictQuery', false)

require('dotenv').config()

const MONGODB_URI = process.env.DB_URL

console.log('connecting to', MONGODB_URI)

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('connected to MDB')
  })
  .catch((error) => {
    console.log('error connection to MDB', error.message)
  })

const typeDefs = `

type Book {
  title: String!
  published: Int!
  author: Author!
  id: ID
  genres: [String!]!
}

type Author {
  name: String!
  id: ID
  born: Int
  bookCount: Int
}

type User {
  username: String!
  favoriteGenre: String!
  id: ID!
}

type Token {
  value: String!
}

type Query {
  bookCount: Int!
  authorCount: Int!
  allBooks(author: String, genre: String): [Book!]!
  allAuthors: [Author!]!
  me: User
}

type Mutation {
  addBook(
    title: String!
    published: Int!
    author: String!
    id: ID
    genres: [String!]!
  ): Book,
  editAuthor(
    name: String!
    setBornTo: Int!
  ): Author
  createUser(
    username: String!
    favoriteGenre: String!
  ): User
  login(
    username: String!
    password: String!
  ): Token
}

`

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
  }
}


const server = new ApolloServer({
  typeDefs,
  resolvers,
})

startStandaloneServer(server, {
  listen: { port: 4000 },
  context: async ({ req, res }) => {
    const auth = req ? req.headers.authorization : null
    if (auth && auth.startsWith('Bearer ')) {
      const decodedToken = jwt.verify(auth.substring(7), process.env.JWT_SECRET)
      const currentUser = await User.findById(decodedToken.id)
      return { currentUser }
    }
  }
}).then(({ url }) => {
  console.log(`Server ready at ${url}`)
})