const { ApolloServer } = require('@apollo/server')
const { startStandaloneServer } = require('@apollo/server/standalone')
const { GraphQLError } = require('graphql')

const Book = require('./models/book')
const Author = require('./models/author')

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

type Query {
  bookCount: Int!
  authorCount: Int!
  allBooks(author: String, genre: String): [Book!]!
  allAuthors: [Author!]!
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
}

`

const resolvers = {
  Query: {
    bookCount: () => Book.collection.countDocuments(),
    authorCount: () => Author.collection.countDocuments(),
    allBooks: async (root, args) => {
      // if no args given
      if(!args.author && !args.genre){ 
        return Book.find({})
      }
      // if only genre given
      else if(args.genre){
        if(args.author){
          const author = await Author.findOne({ name: args.author })
          return Book.find({ genres: args.genre, author: author._id }).populate('author')
        } 
        else return await Book.find({ genres: args.genre  })
      }
      // if only author given
      else {
        const author = await Author.findOne({ name: args.author })
        return Book.find({ author: author._id }).populate('author')
      } 
    },
    allAuthors : async (root, args) => Author.find({})
  },
  Mutation: {
    addBook: async (root, args) => {
      let bookAuthor = await Author.findOne({ name: args.author })
      if(!bookAuthor){
        bookAuthor = await Author.create({ name: args.author })
      }
      const newBook = new Book({ ...args, author: bookAuthor })
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

    editAuthor: async (root, args) => {
      //throw if published year not 4 digits
      if(args.setBornTo < 1000 || args.setBornTo > 9999){
        throw new GraphQLError('invalid published year format' , {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.setBornTo,
          }
        })
      }

      // we need to return author object for find+update not useful
      const findAuthor = await Author.findOne({ name: args.name })

      // throw if author doesn't exist
      if(!findAuthor){
        throw new GraphQLError('Author not found' , {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.name,
          }
        })
      }

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
    }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

startStandaloneServer(server, {
  listen: { port: 4000 },
}).then(({ url }) => {
  console.log(`Server ready at ${url}`)
})