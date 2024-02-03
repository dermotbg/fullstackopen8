const { ApolloServer } = require('@apollo/server')
const { startStandaloneServer } = require('@apollo/server/standalone')
const { v1: uuid } = require('uuid')

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

let authors = [
  {
    name: 'Robert Martin',
    id: "afa51ab0-344d-11e9-a414-719c6709cf3e",
    born: 1952,
  },
  {
    name: 'Martin Fowler',
    id: "afa5b6f0-344d-11e9-a414-719c6709cf3e",
    born: 1963
  },
  {
    name: 'Fyodor Dostoevsky',
    id: "afa5b6f1-344d-11e9-a414-719c6709cf3e",
    born: 1821
  },
  { 
    name: 'Joshua Kerievsky', // birthyear not known
    id: "afa5b6f2-344d-11e9-a414-719c6709cf3e",
  },
  { 
    name: 'Sandi Metz', // birthyear not known
    id: "afa5b6f3-344d-11e9-a414-719c6709cf3e",
  },
]

/*
 * Suomi:
 * Saattaisi olla järkevämpää assosioida kirja ja sen tekijä tallettamalla kirjan yhteyteen tekijän nimen sijaan tekijän id
 * Yksinkertaisuuden vuoksi tallennamme kuitenkin kirjan yhteyteen tekijän nimen
 *
 * English:
 * It might make more sense to associate a book with its author by storing the author's id in the context of the book instead of the author's name
 * However, for simplicity, we will store the author's name in connection with the book
 *
 * Spanish:
 * Podría tener más sentido asociar un libro con su autor almacenando la id del autor en el contexto del libro en lugar del nombre del autor
 * Sin embargo, por simplicidad, almacenaremos el nombre del autor en conección con el libro
*/

let books = [
  {
    title: 'Clean Code',
    published: 2008,
    author: 'Robert Martin',
    id: "afa5b6f4-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring']
  },
  {
    title: 'Agile software development',
    published: 2002,
    author: 'Robert Martin',
    id: "afa5b6f5-344d-11e9-a414-719c6709cf3e",
    genres: ['agile', 'patterns', 'design']
  },
  {
    title: 'Refactoring, edition 2',
    published: 2018,
    author: 'Martin Fowler',
    id: "afa5de00-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring']
  },
  {
    title: 'Refactoring to patterns',
    published: 2008,
    author: 'Joshua Kerievsky',
    id: "afa5de01-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring', 'patterns']
  },  
  {
    title: 'Practical Object-Oriented Design, An Agile Primer Using Ruby',
    published: 2012,
    author: 'Sandi Metz',
    id: "afa5de02-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring', 'design']
  },
  {
    title: 'Crime and punishment',
    published: 1866,
    author: 'Fyodor Dostoevsky',
    id: "afa5de03-344d-11e9-a414-719c6709cf3e",
    genres: ['classic', 'crime']
  },
  {
    title: 'The Demon ',
    published: 1872,
    author: 'Fyodor Dostoevsky',
    id: "afa5de04-344d-11e9-a414-719c6709cf3e",
    genres: ['classic', 'revolution']
  },
]

/*
  you can remove the placeholder query once your first one has been implemented 
*/

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
      return Book.find({})
    },
    // allBooks: (root, args) => {
    //   if(!args.author && !args.genre){ 
    //     return books
    //   }
    //   else if (args.genre){
    //     const filteredGenres = books.filter(b => {
    //       if (b.genres.includes(args.genre)){
    //         return b
    //       }
    //     })
    //     if(args.author) return filteredGenres.filter((b) => b.author === args.author)
    //     else return filteredGenres
    //   }
    //   return books.filter((b) => b.author === args.author)
    // },
    allAuthors : async (root, args) => Author.find({})
    // allAuthors: () => {
    //   return authors.map(a => {
    //     const filtered = books.filter(b => b.author === a.name)
    //     return { ...a, bookCount: filtered.length }
    //   })
    // }
  },
  Mutation: {
    addBook: async (root, args) => {
      const newBook = new Book({ ...args })
      try{
        await newBook.save()
      }
      catch(error){
        throw new GraphQLError('Add book faied' , {
          extensions: 'BAD_USER_INPUT',
          invalidArgs: args.title,
          error
        })
      }
      // if(!authors.find(a => a.author === args.author)){
      //   authors = authors.concat({ name: args.author, id: uuid() })
      // }
      // const newBook = { ...args, id: uuid()}
      // books = books.concat(newBook)
      // return newBook
    },
    editAuthor: (root, args) => {
      const findAuthor = authors.find((a) => a.name === args.name)
      if(!findAuthor) return null 
      const editedAuthor = { ...findAuthor, born: args.setBornTo }
      authors = authors.filter(a => a.name !== args.name).concat(editedAuthor)
      return editedAuthor
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